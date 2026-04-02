document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // LANGUAGE / I18N LOGIC
    // =============================================
    let currentLang = 'en';
    const translations = {
        en: {
            nav_dashboard: "Dashboard",
            hero_title_1: "Smart Agriculture Intelligence",
            hero_title_2: "at Your",
            hero_title_3: "Fingertips",
            hero_subtitle: "Empowering farmers with real-time data, AI-driven crop health analysis, and elite precision agronomy for a sustainable future.",
            card_ask_title: "Ask Agriculture Assistant",
            placeholder_question: "e.g. 'What is the ideal soil pH for organic tomato farming in clay soil?'",
            btn_speak: "Speak",
            btn_ask: "Ask AgroGPT",
            response_header: "✨ AgroGPT Answer",
            btn_analyze: "Analyze",
            btn_clear: "Clear",
            card_scanner_title: "Plant Disease Scanner",
            upload_text: "Upload or Drag an image of the plant leaf",
            upload_subtext: "Supports JPG, PNG, up to 10MB",
            weather_live: "Live",
            weather_loading: "Loading...",
            weather_humidity: "Humidity",
            weather_wind: "Wind",
            card_try_title: "Try Asking",
            try_pest: "Pest control for corn",
            try_market: "Market rates for wheat",
            try_fertilizer: "Organic fertilizers",
            try_drought: "Drought resistance",
            card_tips_title: "Pro Tips",
            tip_1_title: "Optimal Seeding",
            tip_1_desc: "Early morning seeding improves moisture retention by 14%.",
            tip_2_title: "AI Soil Mapping",
            tip_2_desc: "Update your soil maps every 90 days for peak accuracy.",
            tip_3_title: "Crop Rotation",
            tip_3_desc: "Rotating legumes with grains naturally replenishes nitrogen."
        },
        ta: {
            nav_dashboard: "டாஷ்போர்டு",
            hero_title_1: "ஸ்மார்ட் விவசாய நுண்ணறிவு",
            hero_title_2: "உங்கள்",
            hero_title_3: "விரல் நுனியில்",
            hero_subtitle: "நிகழ்நேர தரவு, AI-இயக்கப்படும் பயிர் சுகாதார பகுப்பாய்வு மற்றும் நிலையான எதிர்காலத்திற்கான துல்லியமான வேளாண்மை மூலம் விவசாயிகளுக்கு அதிகாரம் அளித்தல்.",
            card_ask_title: "விவசாய உதவியாளரிடம் கேளுங்கள்",
            placeholder_question: "எ.கா. 'களிமண் மண்ணில் கரிம தக்காளி விவசாயத்திற்கு உகந்த மண் pH என்ன?'",
            btn_speak: "பேச",
            btn_ask: "AgroGPT-யிடம் கேட்க",
            response_header: "✨ AgroGPT பதில்",
            btn_analyze: "பகுப்பாய்வு",
            btn_clear: "அழி",
            card_scanner_title: "தாவர நோய் ஸ்கேனர்",
            upload_text: "தாவர இலையின் படத்தை பதிவேற்றவும் அல்லது இழுக்கவும்",
            upload_subtext: "JPG, PNG ஆதரவு, 10MB வரை",
            weather_live: "நேரலை",
            weather_loading: "ஏற்றப்படுகிறது...",
            weather_humidity: "ஈரப்பதம்",
            weather_wind: "காற்று",
            card_try_title: "முயற்சி செய்து பாருங்கள்",
            try_pest: "சோளத்திற்கான பூச்சி கட்டுப்பாடு",
            try_market: "கோதுமைக்கான சந்தை விலைகள்",
            try_fertilizer: "கரிம உரங்கள்",
            try_drought: "வறட்சி எதிர்ப்பு",
            card_tips_title: "நிபுணர் குறிப்புகள்",
            tip_1_title: "சிறந்த விதைப்பு",
            tip_1_desc: "அதிகாலை விதைப்பு ஈரப்பதத்தை 14% மேம்படுத்துகிறது.",
            tip_2_title: "AI மண் வரைபடம்",
            tip_2_desc: "துல்லியத்திற்காக ஒவ்வொரு 90 நாட்களுக்கும் உங்கள் மண் வரைபடங்களை புதுப்பிக்கவும்.",
            tip_3_title: "பயிர் சுழற்சி",
            tip_3_desc: "பருப்பு வகைகளை தானியங்களுடன் சுழற்றுவது இயற்கையாகவே நைட்ரஜனை நிரப்புகிறது."
        },
        ml: {
            nav_dashboard: "ഡാഷ്‌ബോർഡ്",
            hero_title_1: "സ്മാർട്ട് അഗ്രിക്കൾച്ചർ ഇന്റലിജൻസ്",
            hero_title_2: "നിങ്ങളുടെ",
            hero_title_3: "വിരൽത്തുമ്പിൽ",
            hero_subtitle: "തത്സമയ ഡാറ്റ, AI അടിസ്ഥാനമാക്കിയുള്ള വിള ആരോഗ്യ വിശകലനം എന്നിവയിലൂടെ കർഷകരെ ശാക്തീകരിക്കുന്നു.",
            card_ask_title: "വിவசாய അസിസ്റ്റന്റിനോട് ചോദിക്കുക",
            placeholder_question: "എ.കാ. 'ജൈവ തക്കാളി കൃഷിക്ക് അനുയോജ്യമായ മണ്ണ് pH എത്രയാണ്?'",
            btn_speak: "സംസാരിക്കുക",
            btn_ask: "AgroGPT-യോട് ചോദിക്കുക",
            response_header: "✨ AgroGPT മറുപടി",
            btn_analyze: "പരിശോധിക്കുക",
            btn_clear: "ഒഴിവാക്കുക",
            card_scanner_title: "സസ്യരോഗ സ്കാനർ",
            upload_text: "സസ്യത്തിന്റെ ഇലയുടെ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക",
            upload_subtext: "JPG, PNG പിന്തുണയ്ക്കുന്നു, 10MB വരെ",
            weather_live: "തത്സമയം",
            weather_loading: "ശേഖരിക്കുന്നു...",
            weather_humidity: "ഈർപ്പം",
            weather_wind: "കാറ്റ്",
            card_try_title: "ഇവ ചോദിക്കാവുന്നതാണ്",
            try_pest: "കാപ്പിയിലെ കീടനിയന്ത്രണം",
            try_market: "വിളകളുടെ വിപണി വില",
            try_fertilizer: "ജൈവ വളങ്ങൾ",
            try_drought: "വരൾച്ചാ പ്രതിരോധം",
            card_tips_title: "നിർദ്ദേശങ്ങൾ",
            tip_1_title: "ശരിയായ വിതയ്ക്കൽ",
            tip_1_desc: "അതിരാവിലെ വിതയ്ക്കുന്നത് 14% ഈർപ്പം നിലനിർത്താൻ സഹായിക്കുന്നു.",
            tip_2_title: "AI സോയിൽ മാപ്പിംഗ്",
            tip_2_desc: "കൃത്യതയ്ക്കായി ഓരോ 90 ദിവസത്തിലും സോയിൽ മാപ്പുകൾ പുതുക്കുക.",
            tip_3_title: "വിള പരിവർത്തനം",
            tip_3_desc: "ധാന്യങ്ങൾക്കൊപ്പം പയറുവർഗ്ഗങ്ങളും കൃഷി ചെയ്യുന്നത് നൈട്രജൻ അളവ് കൂട്ടുന്നു."
        }
    };

    function updateContent() {
        const langData = translations[currentLang];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (langData[key]) {
                el.innerText = langData[key];
            }
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (langData[key]) {
                el.placeholder = langData[key];
            }
        });
        const langDisplay = document.getElementById('langDisplay');
        if (langDisplay) {
            const labels = { en: 'தமிழ்', ta: 'മലയാളം', ml: 'English' };
            langDisplay.innerText = labels[currentLang];
        }
    }

    window.toggleLanguage = () => {
        if (currentLang === 'en') currentLang = 'ta';
        else if (currentLang === 'ta') currentLang = 'ml';
        else currentLang = 'en';
        updateContent();
    };

    // Initialize English content labels
    updateContent();

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

    loadWeather();
    setInterval(loadWeather, 10 * 60 * 1000);

    // =============================================
    // VOICE / SPEECH-TO-TEXT LOGIC
    // =============================================
    let recognition = null;
    let isListening = false;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    window.startVoiceInput = (langCode, btn) => {
        if (!SpeechRecognition) {
            alert('Voice input is not supported in this browser. Please use Chrome or Edge.');
            return;
        }

        const textarea = document.getElementById('questionInput');

        if (isListening) {
            if (recognition) recognition.stop();
            // Don't early return if we clicked a DIFFERENT button, stop then start
            // But simple implementation: just stop.
            if (btn && btn.classList.contains('ring-2')) return; 
        }

        recognition = new SpeechRecognition();
        recognition.lang = langCode;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            isListening = true;
            if (btn) {
                btn.dataset.oldHtml = btn.innerHTML;
                btn.innerHTML = `<span class="material-symbols-outlined text-sm animate-pulse text-red-500">mic</span> ...`;
                btn.classList.add('ring-2', 'ring-red-400');
            }
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) finalTranscript += transcript;
                else interimTranscript += transcript;
            }
            if (textarea) textarea.value = finalTranscript || interimTranscript;
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
            if (btn) {
                btn.innerHTML = btn.dataset.oldHtml;
                btn.classList.remove('ring-2', 'ring-red-400');
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
            btn.innerHTML = `${translations[currentLang].btn_ask} <span class="material-symbols-outlined">send</span>`;
            btn.disabled = false;
        }
    };

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
            if (!isLoggedIn) { openAuthModal(); return; }
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
            btn.innerHTML = translations[currentLang].btn_analyze;
            btn.disabled = false;
        }
    };

    document.querySelectorAll('[data-suggestion]').forEach(btn => {
        btn.addEventListener('click', () => {
            const q = document.getElementById('questionInput');
            if (q) { q.value = btn.dataset.suggestion; q.focus(); }
        });
    });

});
