
document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // AUTH MODAL LOGIC
    // =============================================
    window.openAuthModal = () => {
        document.getElementById('authModalOverlay').style.display = 'flex';
        toggleAuthView('login');
    };

    window.closeAuthModal = () => {
        document.getElementById('authModalOverlay').style.display = 'none';
        document.getElementById('authLoginView').style.display = 'none';
        document.getElementById('authRegisterView').style.display = 'none';
    };

    window.toggleAuthView = (view) => {
        if (view === 'login') {
            document.getElementById('authLoginView').style.display = 'block';
            document.getElementById('authRegisterView').style.display = 'none';
        } else {
            document.getElementById('authLoginView').style.display = 'none';
            document.getElementById('authRegisterView').style.display = 'block';
        }
    };

    let isLoggedIn = false;
    let currentUserData = null;

    async function checkAuthStatus() {
        try {
            const res = await fetch('/api/user');
            const data = await res.json();
            isLoggedIn = data.logged_in;
            currentUserData = data;
            const btn = document.getElementById('authHeaderBtn');
            const outBtn = document.getElementById('logoutHeaderBtn');
            if (isLoggedIn) {
                if (btn) btn.classList.add('hidden');
                if (outBtn) {
                    outBtn.classList.remove('hidden');
                    outBtn.title = 'Logout ' + data.full_name;
                }
            } else {
                if (btn) btn.classList.remove('hidden');
                if (outBtn) outBtn.classList.add('hidden');
            }
        } catch (e) { console.error('Auth check failed:', e); }
    }
    checkAuthStatus();

    window.submitLogin = async () => {
        const email = document.getElementById('authLoginEmail').value;
        const password = document.getElementById('authLoginPassword').value;
        const btn = document.getElementById('authLoginBtn');
        if (!email || !password) return alert('Email and password required');
        btn.innerHTML = 'Logging in...';
        btn.disabled = true;
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) { closeAuthModal(); checkAuthStatus(); }
            else alert(data.error);
        } catch (e) { alert('Connection failed'); }
        finally { btn.innerHTML = '<span class="relative z-10">Login</span>'; btn.disabled = false; }
    };

    window.submitRegister = async () => {
        const full_name = document.getElementById('authRegName').value;
        const profession = document.getElementById('authRegProfession').value;
        const email = document.getElementById('authRegEmail').value;
        const password = document.getElementById('authRegPassword').value;
        const btn = document.getElementById('authRegBtn');
        if (!email || !password || !full_name || !profession) return alert('All fields required');
        btn.innerHTML = 'Creating...';
        btn.disabled = true;
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, full_name, profession })
            });
            const data = await res.json();
            if (res.ok) { closeAuthModal(); checkAuthStatus(); }
            else alert(data.error);
        } catch (e) { alert('Connection failed'); }
        finally { btn.innerHTML = 'Create Account'; btn.disabled = false; }
    };

    window.logoutUser = async () => {
        try {
            await fetch('/api/logout', { method: 'POST' });
            checkAuthStatus();
        } catch (e) { console.error(e); }
    };

    // =============================================
    // LIVE WEATHER LOGIC
    // =============================================
    const districtSelect = document.getElementById('districtSelect');

    window.loadWeather = async () => {
        const district = districtSelect ? districtSelect.value : 'Chennai';
        const tempEl = document.getElementById('weatherTemp');
        const condEl = document.getElementById('weatherCondition');
        const emojiEl = document.getElementById('weatherEmoji');
        const humEl = document.getElementById('weatherHumidity');
        const windEl = document.getElementById('weatherWind');

        if (condEl) condEl.textContent = 'Updating...';

        try {
            const res = await fetch(`/api/weather?district=${encodeURIComponent(district)}`);
            const data = await res.json();
            if (data.success) {
                if (tempEl) tempEl.textContent = data.temperature;
                if (condEl) condEl.textContent = data.condition;
                if (emojiEl) emojiEl.textContent = data.emoji;
                if (humEl) humEl.textContent = data.humidity + '%';
                if (windEl) windEl.textContent = data.wind_speed + ' km/h';
            } else {
                if (condEl) condEl.textContent = 'Unavailable';
            }
        } catch (e) {
            console.error('Weather fetch failed:', e);
            if (condEl) condEl.textContent = 'Error loading';
        }
    };

    // Load weather immediately for default district, then refresh every 10 minutes
    loadWeather();
    setInterval(loadWeather, 10 * 60 * 1000);

    // =============================================
    // VOICE / SPEECH-TO-TEXT LOGIC
    // =============================================
    let recognition = null;
    let isListening = false;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    window.startVoiceInput = () => {
        if (!SpeechRecognition) {
            alert('Voice input is not supported in this browser. Please use Chrome or Edge.');
            return;
        }

        const micBtn = document.getElementById('voiceMicBtn');
        const textarea = document.getElementById('questionInput');

        if (isListening) {
            // Stop listening
            if (recognition) recognition.stop();
            return;
        }

        recognition = new SpeechRecognition();
        // Accept any language — multilingual support
        recognition.lang = '';            // empty = browser picks user's OS language
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            isListening = true;
            if (micBtn) {
                micBtn.innerHTML = '<span class="material-symbols-outlined text-xs animate-pulse text-red-500">mic</span> Listening...';
                micBtn.classList.add('ring-2', 'ring-red-400');
            }
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            if (textarea) {
                textarea.value = finalTranscript || interimTranscript;
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            let msg = 'Voice recognition failed.';
            if (event.error === 'not-allowed') msg = 'Microphone access denied. Please allow microphone permissions.';
            else if (event.error === 'no-speech') msg = 'No speech detected. Please try again.';
            else if (event.error === 'network') msg = 'Network error during voice recognition.';
            alert(msg);
        };

        recognition.onend = () => {
            isListening = false;
            if (micBtn) {
                micBtn.innerHTML = '<span class="material-symbols-outlined text-xs">mic</span> Speak';
                micBtn.classList.remove('ring-2', 'ring-red-400');
            }
        };

        recognition.start();
    };

    // =============================================
    // CHAT / ASK LOGIC
    // =============================================
    window.askQuestion = async () => {
        const qInput = document.getElementById('questionInput');
        const question = qInput ? qInput.value.trim() : '';
        if (!question) return alert('Please enter a question.');

        const district = districtSelect ? districtSelect.value : '';
        const btn = document.getElementById('askButton');
        btn.innerHTML = 'Thinking... <span class="material-symbols-outlined animate-spin text-sm">progress_activity</span>';
        btn.disabled = true;

        try {
            const res = await fetch('/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, district })
            });
            const data = await res.json();
            showResponse(data.answer || data.error, !res.ok);
        } catch (e) {
            showResponse('Connection failed. Please check server.', true);
        } finally {
            btn.innerHTML = 'Ask AgroGPT <span class="material-symbols-outlined">send</span>';
            btn.disabled = false;
        }
    };

    // Allow Enter key (without Shift) to submit
    const qInput = document.getElementById('questionInput');
    if (qInput) {
        qInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                askQuestion();
            }
        });
    }

    function showResponse(text, isError) {
        const rc = document.getElementById('responseContainer');
        const rt = document.getElementById('responseText');
        if (!rc || !rt) return;
        rc.style.display = 'block';
        // Preserve newlines for the multi-language output
        rt.style.whiteSpace = 'pre-wrap';
        rt.textContent = text;
        rc.style.borderLeftColor = isError ? '#ba1a1a' : '#006e2f';
        rc.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // =============================================
    // PLANT DISEASE SCANNER / IMAGE UPLOAD
    // =============================================
    let selectedFile = null;
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const previewContainer = document.getElementById('previewContainer');
    const previewImg = document.getElementById('previewImg');

    if (uploadArea && imageInput) {
        uploadArea.onclick = () => {
            if (!isLoggedIn) {
                openAuthModal();
                return;
            }
            imageInput.click();
        };

        imageInput.onchange = (e) => {
            if (e.target.files.length > 0) handleFile(e.target.files[0]);
        };

        uploadArea.ondragover = (e) => { e.preventDefault(); uploadArea.classList.add('border-secondary'); };
        uploadArea.ondragleave = () => { uploadArea.classList.remove('border-secondary'); };
        uploadArea.ondrop = (e) => {
            e.preventDefault();
            uploadArea.classList.remove('border-secondary');
            if (!isLoggedIn) { openAuthModal(); return; }
            if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
        };
    }

    function handleFile(file) {
        if (!file.type.startsWith('image/')) return alert('Please upload an image file.');
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            if (previewImg) previewImg.src = e.target.result;
            if (previewContainer) previewContainer.classList.remove('hidden');
            if (uploadArea) uploadArea.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }

    window.removeImage = () => {
        selectedFile = null;
        if (previewContainer) previewContainer.classList.add('hidden');
        if (uploadArea) uploadArea.classList.remove('hidden');
        if (imageInput) imageInput.value = '';
    };

    window.analyzeImage = async () => {
        if (!selectedFile) return;
        const btn = document.getElementById('analyzeButton');
        btn.innerHTML = 'Analyzing...';
        btn.disabled = true;
        try {
            const formData = new FormData();
            formData.append('image', selectedFile);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (res.ok) showResponse(data.analysis);
            else showResponse(data.error || 'Image analysis failed.', true);
        } catch (e) {
            showResponse('Connection failed.', true);
        } finally {
            btn.innerHTML = 'Analyze';
            btn.disabled = false;
        }
    };

    // =============================================
    // QUICK SUGGESTION CHIPS — wire to textarea
    // =============================================
    document.querySelectorAll('[data-suggestion]').forEach(btn => {
        btn.addEventListener('click', () => {
            const q = document.getElementById('questionInput');
            if (q) { q.value = btn.dataset.suggestion; q.focus(); }
        });
    });

});
