// Supabase Configuration
const SUPABASE_URL = 'https://oowacnfvdvnzwrosfgyy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vd2FjbmZ2ZHZuendyb3NmZ3l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwOTkyODgsImV4cCI6MjA3MjY3NTI4OH0.gt48e3zWhMHjrn3SGqYbi_CcasVZkyITY_Dh7KXxttw';

// Initialize Supabase client
let supabase;
try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (error) {
    console.error('خطأ في تهيئة Supabase:', error);
}

// Global Variables
let currentSession = null;
let isScanning = false;
let stream = null;
let stats = { success: 0, errors: 0, total: 0 };

// Audio for error sound
const errorSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAAA=');

// Initialize app
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    setupEventListeners();
    
    // إظهار التبويب الرئيسي
    showTab('home');
    
    // تحديث الإحصائيات
    updateStatsDisplay();
    
    // إخفاء شاشة التحميل
    showLoading(false);
}

function hideAllSections() {
    // إخفاء العناصر القديمة إذا كانت موجودة (للتوافق مع التصميم القديم)
    const oldElements = ['barcodeSection', 'previousSessions', 'reportsSection', 'currentSessionInfo'];
    oldElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('hidden');
        }
    });
}

function setupEventListeners() {
    document.getElementById('barcodeInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') processBarcodeInput();
    });
}

// Tab Management Functions
function showTab(tabName) {
    // إخفاء جميع التبويبات
    const allTabs = document.querySelectorAll('.tab-content');
    allTabs.forEach(tab => {
        tab.classList.remove('active');
    });

    // إزالة active من جميع روابط التبويبات
    const allTabLinks = document.querySelectorAll('.tab-link');
    allTabLinks.forEach(link => {
        link.classList.remove('active');
    });

    // إظهار التبويب المحدد
    const targetTab = document.getElementById(tabName + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }

    // تفعيل رابط التبويب
    const activeLink = document.querySelector(`[onclick="showTab('${tabName}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // تنفيذ إجراءات خاصة لكل تبويب
    switch(tabName) {
        case 'home':
            updateHomeTab();
            break;
        case 'scan':
            updateScanTab();
            break;
        case 'sessions':
            loadPreviousSessionsForTab();
            break;
        case 'reports':
            loadReportsForTab();
            break;
    }
}

function updateHomeTab() {
    // تحديث الإحصائيات
    updateStatsDisplay();
    
    // تحديث عداد الجلسة النشطة
    const activeCount = currentSession ? 1 : 0;
    document.getElementById('activeSessionCount').textContent = activeCount;
    
    // إظهار أو إخفاء معلومات الجلسة النشطة
    if (currentSession) {
        document.getElementById('currentSessionInfo').classList.remove('hidden');
    } else {
        document.getElementById('currentSessionInfo').classList.add('hidden');
    }
}

function updateScanTab() {
    if (currentSession) {
        document.getElementById('noActiveSession').classList.add('hidden');
        document.getElementById('activeScanSection').classList.remove('hidden');
        
        // تركيز على حقل الإدخال
        setTimeout(() => {
            document.getElementById('barcodeInput').focus();
        }, 100);
    } else {
        document.getElementById('noActiveSession').classList.remove('hidden');
        document.getElementById('activeScanSection').classList.add('hidden');
    }
}

async function loadPreviousSessionsForTab() {
    try {
        showLoading(true);
        
        let sessions = [];
        
        if (supabase) {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .order('start_time', { ascending: false });
                
            if (error) throw error;
            sessions = data || [];
        }

        displayMobileSessionsList(sessions);
        
    } catch (error) {
        console.error('خطأ في تحميل الجلسات:', error);
        showMessage('خطأ في تحميل الجلسات السابقة', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadReportsForTab() {
    try {
        showLoading(true);
        
        let allSessions = [];
        let allBarcodes = [];
        
        if (supabase) {
            const [sessionsResult, barcodesResult] = await Promise.all([
                supabase.from('sessions').select('*').order('start_time', { ascending: false }),
                supabase.from('barcodes').select('*').order('scan_time', { ascending: false })
            ]);
            
            if (sessionsResult.error) throw sessionsResult.error;
            if (barcodesResult.error) throw barcodesResult.error;
            
            allSessions = sessionsResult.data || [];
            allBarcodes = barcodesResult.data || [];
        }

        displayMobileReportContent(allSessions, allBarcodes);
        
    } catch (error) {
        console.error('خطأ في تحميل التقارير:', error);
        showMessage('خطأ في تحميل التقارير', 'error');
    } finally {
        showLoading(false);
    }
}

// Session Management Functions
function showNewSessionDialog() {
    document.getElementById('clientNameInput').value = '';
    document.getElementById('newSessionModal').style.display = 'block';
}

function closeNewSessionModal() {
    document.getElementById('newSessionModal').style.display = 'none';
}

async function createNewSession() {
    const clientName = document.getElementById('clientNameInput').value.trim();
    
    if (!clientName) {
        showMessage('يرجى إدخال اسم العميل', 'error');
        return;
    }
    
    try {
        showLoading(true);
        closeNewSessionModal();
        
        const sessionData = {
            user_id: 'anonymous',
            client_name: clientName,
            start_time: new Date().toISOString(),
            total_barcodes: 0,
            success_count: 0,
            error_count: 0
        };

        if (supabase) {
            const { data, error } = await supabase
                .from('sessions')
                .insert([sessionData])
                .select()
                .single();

            if (error) throw error;
            currentSession = data;
        } else {
            // Fallback for offline mode
            currentSession = {
                id: Date.now(),
                ...sessionData
            };
        }

        // Update UI
        document.getElementById('currentClientName').textContent = currentSession.client_name;
        document.getElementById('currentSessionId').textContent = currentSession.id;
        document.getElementById('sessionStartTime').textContent = formatDateTime(currentSession.start_time);
        document.getElementById('sessionBarcodeCount').textContent = '0';
        
        // Reset stats
        stats = { success: 0, errors: 0, total: 0 };
        updateStatsDisplay();
        
        // التبديل إلى تبويب الرئيسية وتحديثه
        showTab('home');
        
        showMessage(`تم بدء جلسة جديدة للعميل: ${clientName}`, 'success');
        
    } catch (error) {
        console.error('خطأ في بدء الجلسة:', error);
        showMessage('خطأ في بدء الجلسة الجديدة', 'error');
    } finally {
        showLoading(false);
    }
}

// Edit Session Functions
function editSession() {
    if (!currentSession) {
        showMessage('لا توجد جلسة نشطة للتعديل', 'error');
        return;
    }
    
    document.getElementById('editClientNameInput').value = currentSession.client_name || '';
    document.getElementById('editSessionModal').style.display = 'block';
}

function closeEditSessionModal() {
    document.getElementById('editSessionModal').style.display = 'none';
}

async function saveSessionEdit() {
    const newClientName = document.getElementById('editClientNameInput').value.trim();
    
    if (!newClientName) {
        showMessage('يرجى إدخال اسم العميل', 'error');
        return;
    }
    
    try {
        showLoading(true);
        closeEditSessionModal();
        
        if (supabase) {
            const { error } = await supabase
                .from('sessions')
                .update({ client_name: newClientName })
                .eq('id', currentSession.id);

            if (error) throw error;
        }

        // Update current session and UI
        currentSession.client_name = newClientName;
        document.getElementById('currentClientName').textContent = newClientName;
        
        showMessage('تم تحديث اسم العميل بنجاح', 'success');
        
    } catch (error) {
        console.error('خطأ في تحديث الجلسة:', error);
        showMessage('خطأ في تحديث الجلسة', 'error');
    } finally {
        showLoading(false);
    }
}

async function endSession() {
    if (!currentSession) {
        showMessage('لا توجد جلسة نشطة لإنهائها', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        if (supabase) {
            const { error } = await supabase
                .from('sessions')
                .update({ 
                    end_time: new Date().toISOString(),
                    total_barcodes: stats.total,
                    success_count: stats.success,
                    error_count: stats.errors
                })
                .eq('id', currentSession.id);

            if (error) throw error;
        }

        // Reset UI
        currentSession = null;
        stats = { success: 0, errors: 0, total: 0 };
        updateStatsDisplay();
        
        // العودة إلى التبويب الرئيسي وتحديثه
        showTab('home');
        
        showMessage('تم إنهاء الجلسة بنجاح', 'success');
        
    } catch (error) {
        console.error('خطأ في إنهاء الجلسة:', error);
        showMessage('خطأ في إنهاء الجلسة', 'error');
    } finally {
        showLoading(false);
    }
}

// Barcode Processing Functions
async function processBarcodeInput() {
    const barcodeValue = document.getElementById('barcodeInput').value.trim();
    
    if (!barcodeValue) {
        showMessage('يرجى إدخال الباركود', 'error');
        return;
    }
    
    if (!currentSession) {
        showMessage('يرجى بدء جلسة جديدة أولاً', 'error');
        return;
    }
    
    await processBarcodeValue(barcodeValue);
    document.getElementById('barcodeInput').value = '';
}

async function processBarcodeValue(barcodeValue) {
    try {
        // تنظيف الباركود من المسافات والرموز غير المرغوبة
        const cleanBarcode = barcodeValue.trim();
        
        // Validate barcode (simple validation - you can customize this)
        const isValid = validateBarcode(cleanBarcode);
        
        const barcodeData = {
            session_id: currentSession.id,
            barcode_value: cleanBarcode,
            scan_time: new Date().toISOString(),
            is_valid: isValid,
            error_message: isValid ? null : 'باركود غير صالح'
        };

        // Save to database
        if (supabase) {
            const { error } = await supabase
                .from('barcodes')
                .insert(barcodeData);
            
            if (error) {
                console.error('Supabase error details:', error);
                throw error;
            }
        }

        // Update stats
        stats.total++;
        if (isValid) {
            stats.success++;
            showSuccessMessage();
            playSuccessSound();
            console.log('✅ تم قراءة باركود صحيح:', cleanBarcode);
        } else {
            stats.errors++;
            showErrorModal('باركود غير صالح: ' + cleanBarcode);
            playErrorSound();
            vibrateDevice();
            console.log('❌ باركود غير صالح:', cleanBarcode);
        }

        updateStatsDisplay();
        updateSessionCount();

    } catch (error) {
        console.error('خطأ في معالجة الباركود:', error);
        showMessage('خطأ في حفظ الباركود', 'error');
    }
}

// Utility Functions
function validateBarcode(barcode) {
    // Simple validation - customize based on your barcode format
    // قبول الباركودات التي تحتوي على 3 أحرف على الأقل
    // وقبول الأحرف والأرقام والرموز الخاصة
    if (!barcode || typeof barcode !== 'string') {
        return false;
    }
    
    // تنظيف الباركود من المسافات
    const cleanBarcode = barcode.trim();
    
    // قبول الباركودات التي تحتوي على 3 أحرف على الأقل
    if (cleanBarcode.length < 3) {
        return false;
    }
    
    // قبول جميع الأحرف والأرقام والرموز الخاصة
    // (إزالة القيود الصارمة على التنسيق)
    return true;
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA') + ' ' + date.toLocaleTimeString('ar-SA');
}

function updateStatsDisplay() {
    document.getElementById('successCount').textContent = stats.success;
    document.getElementById('errorCount').textContent = stats.errors;
    document.getElementById('totalCount').textContent = stats.total;
}

function updateSessionCount() {
    if (currentSession) {
        document.getElementById('sessionBarcodeCount').textContent = stats.total;
    }
}

// UI Functions
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

function showMessage(message, type) {
    // Create and show temporary message
    const messageDiv = document.createElement('div');
    
    // تحديد نوع الرسالة
    if (type === 'success') {
        messageDiv.className = 'success-message';
    } else if (type === 'warning') {
        messageDiv.className = 'error-message';
        messageDiv.style.background = '#fff3cd';
        messageDiv.style.color = '#856404';
        messageDiv.style.borderColor = '#ffeaa7';
    } else {
        messageDiv.className = 'error-message';
    }
    
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '9999';
    messageDiv.style.maxWidth = '300px';
    messageDiv.style.wordWrap = 'break-word';
    
    document.body.appendChild(messageDiv);
    
    // إزالة الرسالة بعد مدة أطول للرسائل المهمة
    const timeout = type === 'warning' ? 5000 : 3000;
    setTimeout(() => {
        if (document.body.contains(messageDiv)) {
            document.body.removeChild(messageDiv);
        }
    }, timeout);
}

function showSuccessMessage() {
    const successMsg = document.getElementById('successMessage');
    successMsg.classList.remove('hidden');
    setTimeout(() => {
        successMsg.classList.add('hidden');
    }, 2000);
}

function showErrorModal(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorModal').style.display = 'block';
}

function closeErrorModal() {
    document.getElementById('errorModal').style.display = 'none';
}

// Barcode CRUD Functions
function editBarcode(barcodeId, currentValue, isValid) {
    document.getElementById('editBarcodeId').value = barcodeId;
    document.getElementById('editBarcodeValue').value = currentValue;
    document.getElementById('editBarcodeStatus').value = isValid.toString();
    document.getElementById('editBarcodeModal').style.display = 'block';
}

function closeEditBarcodeModal() {
    document.getElementById('editBarcodeModal').style.display = 'none';
}

async function saveBarcodeEdit() {
    const barcodeId = document.getElementById('editBarcodeId').value;
    const newValue = document.getElementById('editBarcodeValue').value.trim();
    const newStatus = document.getElementById('editBarcodeStatus').value === 'true';
    
    if (!newValue) {
        showMessage('يرجى إدخال قيمة الباركود', 'error');
        return;
    }
    
    try {
        showLoading(true);
        closeEditBarcodeModal();
        
        if (supabase) {
            const { error } = await supabase
                .from('barcodes')
                .update({ 
                    barcode_value: newValue,
                    is_valid: newStatus,
                    error_message: newStatus ? null : 'تم تعديله يدوياً'
                })
                .eq('id', barcodeId);

            if (error) throw error;
        }

        showMessage('تم تحديث الباركود بنجاح', 'success');
        
        // Refresh current view if we're in session details
        if (document.getElementById('reportsSection').classList.contains('hidden') === false) {
            const sessionId = getCurrentSessionIdFromReport();
            if (sessionId) {
                viewSessionDetails(sessionId);
            }
        }
        
    } catch (error) {
        console.error('خطأ في تحديث الباركود:', error);
        showMessage('خطأ في تحديث الباركود', 'error');
    } finally {
        showLoading(false);
    }
}

async function deleteBarcode() {
    const barcodeId = document.getElementById('editBarcodeId').value;
    
    if (!confirm('هل أنت متأكد من حذف هذا الباركود؟')) {
        return;
    }
    
    try {
        showLoading(true);
        closeEditBarcodeModal();
        
        if (supabase) {
            const { error } = await supabase
                .from('barcodes')
                .delete()
                .eq('id', barcodeId);

            if (error) throw error;
        }

        showMessage('تم حذف الباركود بنجاح', 'success');
        
        // Update stats if this is current session
        if (currentSession) {
            stats.total = Math.max(0, stats.total - 1);
            updateStatsDisplay();
            updateSessionCount();
        }
        
        // Refresh current view if we're in session details
        if (document.getElementById('reportsSection').classList.contains('hidden') === false) {
            const sessionId = getCurrentSessionIdFromReport();
            if (sessionId) {
                viewSessionDetails(sessionId);
            }
        }
        
    } catch (error) {
        console.error('خطأ في حذف الباركود:', error);
        showMessage('خطأ في حذف الباركود', 'error');
    } finally {
        showLoading(false);
    }
}

function getCurrentSessionIdFromReport() {
    // Extract session ID from current report view
    const reportContent = document.getElementById('reportContent').innerHTML;
    const match = reportContent.match(/الجلسة #(\d+)/);
    return match ? parseInt(match[1]) : null;
}

// Audio and Vibration Functions
function playSuccessSound() {
    // Create success sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

function playErrorSound() {
    try {
        errorSound.currentTime = 0;
        errorSound.play().catch(e => console.log('Cannot play error sound:', e));
    } catch (e) {
        console.log('Error playing sound:', e);
    }
}

function vibrateDevice() {
    if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
    }
}

// Camera Scanner Functions
async function toggleScanner() {
    const toggleBtn = document.getElementById('scannerToggle');
    
    if (isScanning) {
        stopScanner();
        toggleBtn.textContent = '📷 تشغيل الماسح';
        toggleBtn.className = 'btn btn-secondary btn-large';
    } else {
        await startScanner();
        toggleBtn.textContent = '⏹️ إيقاف الماسح';
        toggleBtn.className = 'btn btn-large';
        toggleBtn.style.background = '#dc3545';
        toggleBtn.style.color = 'white';
    }
}

async function startScanner() {
    try {
        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        // تحسين أداء Canvas للقراءة المتكررة
        const context = canvas.getContext('2d', { willReadFrequently: true });

        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });

        video.srcObject = stream;
        video.classList.remove('hidden');
        isScanning = true;

        video.addEventListener('loadedmetadata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            scanFrame();
        });

    } catch (error) {
        console.error('خطأ في تشغيل الكاميرا:', error);
        showMessage('خطأ في الوصول للكاميرا', 'error');
    }
}

function stopScanner() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    document.getElementById('video').classList.add('hidden');
    isScanning = false;
    
    // تحديث زر الماسح
    const toggleBtn = document.getElementById('scannerToggle');
    if (toggleBtn) {
        toggleBtn.textContent = '📷 تشغيل الماسح';
        toggleBtn.className = 'btn btn-secondary btn-large';
        toggleBtn.style.background = '';
        toggleBtn.style.color = '';
    }
}

function scanFrame() {
    if (!isScanning) return;

    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        if (window.jsQR) {
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code) {
                console.log('📷 تم قراءة الباركود بالكاميرا:', code.data);
                processBarcodeValue(code.data);
                stopScanner();
                // إزالة الرسالة المكررة لأن processBarcodeValue تظهر الرسالة المناسبة
                return;
            }
        }
    }

    requestAnimationFrame(scanFrame);
}

// Session Management Functions
async function showPreviousSessions() {
    try {
        showLoading(true);
        
        let sessions = [];
        
        if (supabase) {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .order('start_time', { ascending: false });
                
            if (error) throw error;
            sessions = data || [];
        }

        // استخدام النظام الجديد للعرض
        displayMobileSessionsList(sessions);
        
        // التبديل إلى تبويب الجلسات
        showTab('sessions');
        
    } catch (error) {
        console.error('خطأ في تحميل الجلسات:', error);
        showMessage('خطأ في تحميل الجلسات السابقة', 'error');
    } finally {
        showLoading(false);
    }
}

function displaySessionsList(sessions) {
    const sessionsList = document.getElementById('sessionsList');
    sessionsList.innerHTML = '';

    if (sessions.length === 0) {
        sessionsList.innerHTML = '<p>لا توجد جلسات سابقة</p>';
        return;
    }

    sessions.forEach(session => {
        const sessionDiv = document.createElement('div');
        sessionDiv.className = 'session-item';
        sessionDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <h4>جلسة #${session.id} - ${session.client_name || 'عميل غير محدد'}</h4>
                    <p><strong>التاريخ:</strong> ${formatDateTime(session.start_time)}</p>
                    <p><strong>إجمالي الباركودات:</strong> ${session.total_barcodes || 0}</p>
                    <p><strong>الصحيحة:</strong> ${session.success_count || 0}</p>
                    <p><strong>الأخطاء:</strong> ${session.error_count || 0}</p>
                </div>
                <div style="display: flex; gap: 5px; flex-direction: column;">
                    <button class="btn btn-primary" style="padding: 5px 10px; font-size: 12px;" onclick="event.stopPropagation(); viewSessionDetails(${session.id})">👁️ عرض</button>
                    <button class="btn btn-success" style="padding: 5px 10px; font-size: 12px;" onclick="event.stopPropagation(); exportSessionToExcel(${session.id}, '${session.client_name}', '${session.start_time}')">📊 تصدير</button>
                    <button class="btn" style="background: #dc3545; color: white; padding: 5px 10px; font-size: 12px;" onclick="event.stopPropagation(); deleteSessionConfirm(${session.id})">🗑️ حذف</button>
                </div>
            </div>
        `;
        sessionDiv.onclick = () => viewSessionDetails(session.id);
        sessionsList.appendChild(sessionDiv);
    });
}

async function viewSessionDetails(sessionId) {
    try {
        showLoading(true);
        
        let barcodes = [];
        let sessionInfo = null;
        
        if (supabase) {
            const [barcodesResult, sessionResult] = await Promise.all([
                supabase
                    .from('barcodes')
                    .select('*')
                    .eq('session_id', sessionId)
                    .order('scan_time', { ascending: false }),
                supabase
                    .from('sessions')
                    .select('*')
                    .eq('id', sessionId)
                    .single()
            ]);
                
            if (barcodesResult.error) throw barcodesResult.error;
            if (sessionResult.error) throw sessionResult.error;
            
            barcodes = barcodesResult.data || [];
            sessionInfo = sessionResult.data;
            
            // Add client name to barcodes for consistency
            barcodes = barcodes.map(barcode => ({
                ...barcode,
                client_name: sessionInfo.client_name
            }));
        }

        displaySessionReport(sessionId, barcodes, sessionInfo);
        
    } catch (error) {
        console.error('خطأ في تحميل تفاصيل الجلسة:', error);
        showMessage('خطأ في تحميل تفاصيل الجلسة', 'error');
    } finally {
        showLoading(false);
    }
}

function loadPreviousSessions() {
    // This will be called on app initialization
    // Could load recent sessions count or summary
}

async function loadStats() {
    // Load overall stats if needed
    updateStatsDisplay();
}

function setupRealtimeUpdates() {
    // Setup Supabase realtime if available
    if (supabase) {
        // Could subscribe to realtime changes
    }
}

// Reports and Export Functions
async function showReports() {
    try {
        showLoading(true);
        
        let allSessions = [];
        let allBarcodes = [];
        
        if (supabase) {
            const [sessionsResult, barcodesResult] = await Promise.all([
                supabase.from('sessions').select('*').order('start_time', { ascending: false }),
                supabase.from('barcodes').select('*').order('scan_time', { ascending: false })
            ]);
            
            if (sessionsResult.error) throw sessionsResult.error;
            if (barcodesResult.error) throw barcodesResult.error;
            
            allSessions = sessionsResult.data || [];
            allBarcodes = barcodesResult.data || [];
        }

        // استخدام النظام الجديد للعرض
        displayMobileReportContent(allSessions, allBarcodes);
        
        // التبديل إلى تبويب التقارير
        showTab('reports');
        
    } catch (error) {
        console.error('خطأ في تحميل التقارير:', error);
        showMessage('خطأ في تحميل التقارير', 'error');
    } finally {
        showLoading(false);
    }
}

function displayReportContent(sessions, barcodes) {
    const reportContent = document.getElementById('reportContent');
    
    const totalSessions = sessions.length;
    const totalBarcodes = barcodes.length;
    const validBarcodes = barcodes.filter(b => b.is_valid).length;
    const invalidBarcodes = totalBarcodes - validBarcodes;
    
    reportContent.innerHTML = `
        <div class="stats" style="margin-bottom: 30px;">
            <div class="stat-card">
                <div class="stat-number">${totalSessions}</div>
                <div class="stat-label">إجمالي الجلسات</div>
            </div>
            <div class="stat-card success">
                <div class="stat-number">${validBarcodes}</div>
                <div class="stat-label">باركود صحيح</div>
            </div>
            <div class="stat-card error">
                <div class="stat-number">${invalidBarcodes}</div>
                <div class="stat-label">باركود خاطئ</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${totalBarcodes}</div>
                <div class="stat-label">إجمالي الباركودات</div>
            </div>
        </div>
        
        <h4>آخر الجلسات:</h4>
        <div class="session-list" style="max-height: 400px; overflow-y: auto;">
            ${sessions.slice(0, 10).map(session => `
                <div class="session-item" onclick="viewSessionDetails(${session.id})">
                    <h5>جلسة #${session.id} - ${session.client_name || 'عميل غير محدد'}</h5>
                    <p><strong>التاريخ:</strong> ${formatDateTime(session.start_time)}</p>
                    <p><strong>الباركودات:</strong> ${session.total_barcodes || 0} (صحيح: ${session.success_count || 0}, خاطئ: ${session.error_count || 0})</p>
                </div>
            `).join('')}
        </div>
    `;
}

function displaySessionReport(sessionId, barcodes, sessionInfo = null) {
    const reportContent = document.getElementById('reportContent');
    const validBarcodes = barcodes.filter(b => b.is_valid);
    const invalidBarcodes = barcodes.filter(b => !b.is_valid);
    
    const clientName = sessionInfo ? sessionInfo.client_name : (barcodes.length > 0 ? barcodes[0].client_name : 'عميل غير محدد');
    
    reportContent.innerHTML = `
        <div style="margin-bottom: 20px;">
            <button class="btn btn-secondary" onclick="showReports()">← العودة للتقارير</button>
            <button class="btn btn-success" onclick="exportSessionToExcel(${sessionId}, '${clientName}', '${sessionInfo ? sessionInfo.start_time : (barcodes.length > 0 ? barcodes[0].scan_time : new Date().toISOString())}')" style="margin-right: 10px;">📊 تصدير Excel</button>
            <button class="btn btn-primary" onclick="addNewBarcode(${sessionId})" style="margin-right: 10px;">➕ إضافة باركود</button>
        </div>
        
        <h3>تفاصيل الجلسة #${sessionId} - ${clientName}</h3>
        
        <div class="stats" style="margin-bottom: 30px;">
            <div class="stat-card">
                <div class="stat-number">${barcodes.length}</div>
                <div class="stat-label">إجمالي الباركودات</div>
            </div>
            <div class="stat-card success">
                <div class="stat-number">${validBarcodes.length}</div>
                <div class="stat-label">صحيح</div>
            </div>
            <div class="stat-card error">
                <div class="stat-number">${invalidBarcodes.length}</div>
                <div class="stat-label">خاطئ</div>
            </div>
        </div>
        
        <h4>قائمة الباركودات:</h4>
        <div style="max-height: 400px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 10px; border: 1px solid #ddd;">الباركود</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">الوقت</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">الحالة</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    ${barcodes.map(barcode => `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;">${barcode.barcode_value}</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${formatDateTime(barcode.scan_time)}</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">
                                <span style="color: ${barcode.is_valid ? 'green' : 'red'};">
                                    ${barcode.is_valid ? '✅ صحيح' : '❌ خاطئ'}
                                </span>
                            </td>
                            <td style="padding: 10px; border: 1px solid #ddd;">
                                <button class="btn btn-primary" style="padding: 3px 8px; font-size: 11px; margin: 2px;" onclick="editBarcode(${barcode.id}, '${barcode.barcode_value}', ${barcode.is_valid})">✏️ تعديل</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('reportsSection').classList.remove('hidden');
}

// Export Functions
async function exportToCSV() {
    try {
        showLoading(true);
        
        let allBarcodes = [];
        if (supabase) {
            const { data, error } = await supabase
                .from('barcodes')
                .select(`
                    *,
                    sessions (
                        start_time,
                        user_id,
                        client_name
                    )
                `)
                .order('scan_time', { ascending: false });
                
            if (error) throw error;
            allBarcodes = data || [];
        }

        const csvContent = generateCSV(allBarcodes);
        downloadFile(csvContent, 'barcode-sessions.csv', 'text/csv');
        
        showMessage('تم تصدير البيانات بنجاح!', 'success');
        
    } catch (error) {
        console.error('خطأ في التصدير:', error);
        showMessage('خطأ في تصدير البيانات', 'error');
    } finally {
        showLoading(false);
    }
}

async function exportToExcel() {
    try {
        showLoading(true);
        
        let allBarcodes = [];
        if (supabase) {
            const { data, error } = await supabase
                .from('barcodes')
                .select(`
                    *,
                    sessions (
                        start_time,
                        user_id,
                        client_name
                    )
                `)
                .order('scan_time', { ascending: false });
                
            if (error) throw error;
            allBarcodes = data || [];
        }

        generateExcel(allBarcodes);
        showMessage('تم تصدير البيانات بنجاح!', 'success');
        
    } catch (error) {
        console.error('خطأ في التصدير:', error);
        showMessage('خطأ في تصدير البيانات', 'error');
    } finally {
        showLoading(false);
    }
}

function generateCSV(barcodes) {
    const headers = ['اسم العميل', 'رقم الجلسة', 'الباركود', 'وقت المسح', 'صحيح/خاطئ', 'رسالة الخطأ', 'تاريخ الجلسة'];
    const rows = barcodes.map(barcode => [
        barcode.client_name || barcode.sessions?.client_name || 'عميل غير محدد',
        barcode.session_id,
        barcode.barcode_value,
        formatDateTime(barcode.scan_time),
        barcode.is_valid ? 'صحيح' : 'خاطئ',
        barcode.error_message || '',
        barcode.sessions ? formatDateTime(barcode.sessions.start_time) : ''
    ]);
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
        
    return '\ufeff' + csvContent; // Add BOM for Arabic support
}

function generateExcel(barcodes, filename = null) {
    if (!window.XLSX) {
        showMessage('مكتبة Excel غير متوفرة', 'error');
        return;
    }
    
    const worksheet = XLSX.utils.json_to_sheet(
        barcodes.map(barcode => ({
            'اسم العميل': barcode.client_name || barcode.sessions?.client_name || 'عميل غير محدد',
            'رقم الجلسة': barcode.session_id,
            'الباركود': barcode.barcode_value,
            'وقت المسح': formatDateTime(barcode.scan_time),
            'الحالة': barcode.is_valid ? 'صحيح' : 'خاطئ',
            'رسالة الخطأ': barcode.error_message || '',
            'تاريخ الجلسة': barcode.sessions ? formatDateTime(barcode.sessions.start_time) : ''
        }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'جلسات الباركود');
    
    const defaultFilename = `barcode-sessions-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename || defaultFilename);
}

// Additional CRUD Functions
function deleteSessionConfirm(sessionId) {
    // تأكيد الحذف مع معلومات إضافية
    const confirmMessage = `هل أنت متأكد من حذف الجلسة رقم ${sessionId}؟\n\nسيتم حذف:\n• الجلسة نفسها\n• جميع الباركودات المرتبطة بها\n• جميع الإحصائيات\n\nهذا الإجراء لا يمكن التراجع عنه!`;
    
    if (confirm(confirmMessage)) {
        deleteSession(sessionId);
    }
}

async function deleteSession(sessionId) {
    try {
        showLoading(true);
        console.log('🗑️ بدء حذف الجلسة:', sessionId);
        
        if (!supabase) {
            showMessage('خطأ: قاعدة البيانات غير متصلة', 'error');
            return;
        }

        // أولاً، تحقق من وجود الجلسة
        const { data: existingSession, error: checkError } = await supabase
            .from('sessions')
            .select('id, client_name')
            .eq('id', sessionId)
            .single();

        if (checkError) {
            console.error('خطأ في التحقق من وجود الجلسة:', checkError);
            if (checkError.code === 'PGRST116') {
                showMessage('الجلسة غير موجودة أو تم حذفها بالفعل', 'error');
                loadPreviousSessionsForTab(); // تحديث القائمة
                return;
            }
            throw checkError;
        }

        console.log('✅ تم العثور على الجلسة:', existingSession);

        // حذف الجلسة (سيتم حذف الباركودات تلقائياً بسبب CASCADE)
        const { data: deletedData, error: deleteError } = await supabase
            .from('sessions')
            .delete()
            .eq('id', sessionId)
            .select(); // إضافة select للحصول على البيانات المحذوفة

        if (deleteError) {
            console.error('خطأ في حذف الجلسة:', deleteError);
            throw deleteError;
        }

        console.log('✅ تم حذف الجلسة بنجاح:', deletedData);

        // التحقق من نجاح الحذف
        if (deletedData && deletedData.length > 0) {
            showMessage(`تم حذف الجلسة "${existingSession.client_name}" بنجاح`, 'success');
        } else {
            console.warn('⚠️ لم يتم حذف أي سجلات');
            showMessage('تحذير: لم يتم العثور على الجلسة للحذف', 'warning');
        }
        
        // تحديث قائمة الجلسات
        await loadPreviousSessionsForTab();
        
    } catch (error) {
        console.error('خطأ في حذف الجلسة:', error);
        showMessage(`خطأ في حذف الجلسة: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

async function exportSessionToExcel(sessionId, clientName, startTime) {
    try {
        showLoading(true);
        
        let barcodes = [];
        if (supabase) {
            const { data, error } = await supabase
                .from('barcodes')
                .select('*')
                .eq('session_id', sessionId)
                .order('scan_time', { ascending: false });
                
            if (error) throw error;
            barcodes = data || [];
        }

        // Add client name to barcodes for export
        barcodes = barcodes.map(barcode => ({
            ...barcode,
            client_name: clientName
        }));

        const date = new Date(startTime).toISOString().split('T')[0];
        const filename = `${sanitizeFilename(clientName)}_${date}_جلسة_${sessionId}.xlsx`;
        
        generateExcel(barcodes, filename);
        showMessage('تم تصدير الجلسة بنجاح', 'success');
        
    } catch (error) {
        console.error('خطأ في تصدير الجلسة:', error);
        showMessage('خطأ في تصدير الجلسة', 'error');
    } finally {
        showLoading(false);
    }
}

function addNewBarcode(sessionId) {
    const barcodeValue = prompt('أدخل قيمة الباركود الجديد:');
    
    if (!barcodeValue || !barcodeValue.trim()) {
        return;
    }
    
    const isValid = validateBarcode(barcodeValue.trim());
    addBarcodeToSession(sessionId, barcodeValue.trim(), isValid);
}

async function addBarcodeToSession(sessionId, barcodeValue, isValid) {
    try {
        showLoading(true);
        
        const barcodeData = {
            session_id: sessionId,
            barcode_value: barcodeValue,
            scan_time: new Date().toISOString(),
            is_valid: isValid,
            error_message: isValid ? null : 'تمت الإضافة يدوياً'
        };

        if (supabase) {
            const { error } = await supabase
                .from('barcodes')
                .insert([barcodeData]);
            
            if (error) throw error;
        }

        showMessage('تم إضافة الباركود بنجاح', 'success');
        
        // Refresh current view
        viewSessionDetails(sessionId);
        
    } catch (error) {
        console.error('خطأ في إضافة الباركود:', error);
        showMessage('خطأ في إضافة الباركود', 'error');
    } finally {
        showLoading(false);
    }
}

function sanitizeFilename(filename) {
    // Remove or replace characters that are not allowed in filenames
    return filename.replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '_');
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

// Mobile Display Functions
function displayMobileSessionsList(sessions) {
    const sessionsList = document.getElementById('sessionsList');
    sessionsList.innerHTML = '';

    if (sessions.length === 0) {
        sessionsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
                <h4>لا توجد جلسات سابقة</h4>
                <p>ابدأ جلسة جديدة لبدء العمل</p>
                <button class="btn btn-primary" onclick="showNewSessionDialog()">🚀 بدء جلسة جديدة</button>
            </div>
        `;
        return;
    }

    sessions.forEach(session => {
        const sessionCard = document.createElement('div');
        sessionCard.className = 'mobile-card';
        sessionCard.style.margin = '10px 0';
        sessionCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 8px 0; color: #667eea;">جلسة #${session.id}</h4>
                    <p style="margin: 4px 0; font-weight: 600; color: #333;">👤 ${session.client_name || 'عميل غير محدد'}</p>
                    <p style="margin: 4px 0; font-size: 14px; color: #666;">📅 ${formatDateTime(session.start_time)}</p>
                </div>
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <button class="btn btn-primary btn-small" onclick="viewSessionDetails(${session.id})">👁️ عرض</button>
                    <button class="btn btn-success btn-small" onclick="exportSessionToExcel(${session.id}, '${session.client_name}', '${session.start_time}')">📊 تصدير</button>
                    <button class="btn btn-small" style="background: #dc3545; color: white;" onclick="deleteSessionConfirm(${session.id})">🗑️ حذف</button>
                </div>
            </div>
            
            <div class="stats-mobile" style="margin-top: 15px;">
                <div class="stat-card-mobile" style="background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);">
                    <div class="stat-number" style="font-size: 18px;">${session.success_count || 0}</div>
                    <div class="stat-label" style="font-size: 12px;">صحيح</div>
                </div>
                <div class="stat-card-mobile" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);">
                    <div class="stat-number" style="font-size: 18px;">${session.error_count || 0}</div>
                    <div class="stat-label" style="font-size: 12px;">خاطئ</div>
                </div>
            </div>
        `;
        
        sessionsList.appendChild(sessionCard);
    });
}

function displayMobileReportContent(sessions, barcodes) {
    const reportContent = document.getElementById('reportContent');
    
    const totalSessions = sessions.length;
    const totalBarcodes = barcodes.length;
    const validBarcodes = barcodes.filter(b => b.is_valid).length;
    const invalidBarcodes = totalBarcodes - validBarcodes;
    
    reportContent.innerHTML = `
        <div class="stats-mobile" style="margin-bottom: 30px;">
            <div class="stat-card-mobile">
                <div class="stat-number">${totalSessions}</div>
                <div class="stat-label">إجمالي الجلسات</div>
            </div>
            <div class="stat-card-mobile success">
                <div class="stat-number">${validBarcodes}</div>
                <div class="stat-label">باركود صحيح</div>
            </div>
            <div class="stat-card-mobile error">
                <div class="stat-number">${invalidBarcodes}</div>
                <div class="stat-label">باركود خاطئ</div>
            </div>
            <div class="stat-card-mobile">
                <div class="stat-number">${totalBarcodes}</div>
                <div class="stat-label">إجمالي الباركودات</div>
            </div>
        </div>
        
        <h4 style="margin-bottom: 15px;">📋 آخر الجلسات:</h4>
        <div style="max-height: 400px; overflow-y: auto;">
            ${sessions.slice(0, 10).map(session => `
                <div class="mobile-card" style="margin: 10px 0; cursor: pointer;" onclick="viewSessionDetails(${session.id})">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h5 style="margin: 0 0 5px 0; color: #667eea;">جلسة #${session.id}</h5>
                            <p style="margin: 2px 0; font-weight: 600;">👤 ${session.client_name || 'عميل غير محدد'}</p>
                            <p style="margin: 2px 0; font-size: 12px; color: #666;">📅 ${formatDateTime(session.start_time)}</p>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 20px; font-weight: bold; color: #667eea;">${session.total_barcodes || 0}</div>
                            <div style="font-size: 11px; color: #666;">باركود</div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}
