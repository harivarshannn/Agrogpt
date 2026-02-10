document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const questionInput = document.getElementById('questionInput');
    const askButton = document.getElementById('askButton');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const responseContainer = document.getElementById('responseContainer');
    const responseText = document.getElementById('responseText');
    const chatLoading = document.getElementById('chatLoading');

    // Image elements
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const previewContainer = document.getElementById('previewContainer');
    const previewImg = document.getElementById('previewImg');
    const analyzeButton = document.getElementById('analyzeButton');

    let selectedFile = null;
    let recognition = null;
    let isRecording = false;

    // --- Localization ---
    const translations = {
        en: {
            title: "AgroGPT",
            tagline: "Smart Agriculture Intelligence at Your Fingertips",
            ask_title: "💬 Ask Agriculture Assistant",
            placeholder: "How can I help you today? Ask about crops, soil, pests...",
            btn_ask: "Ask AgroGPT",
            loading: "🌱 Assistant is thinking...",
            response_header: "✨ Assistant's Answer",
            scanner_title: "🔍 Plant Disease Scanner",
            scanner_desc: "Upload a photo of your plant leaves to identify diseases and get organic/chemical treatment advice.",
            upload_text: "Click to Take a Photo or Upload",
            upload_hint: "Supports JPG, PNG (Max 16MB)",
            btn_analyze: "✨ Analyze Disease",
            btn_clear: "🗑️ Clear",
            try_asking: "💡 Try Asking...",
            ex_ginger: "Organic Ginger",
            ex_pests: "Tomato Pests",
            ex_paddy: "Paddy Nutrition",
            ex_soil: "Soil Health",
            ex_crops: "Seasonal Crops",
            pro_tips: "🌟 Pro Tips",
            tip_photos_title: "Clear Photos:",
            tip_photos_desc: "Capture the top and bottom of affected leaves for better detection.",
            tip_voice_title: "Voice Commands:",
            tip_voice_desc: "Click ML or EN and ask your question loudly for better results.",
            status_connecting: "Connecting...",
            status_ready: "AgroGPT Ready",
            status_offline: "Offline",
            alert_question: "Please enter a question!",
            alert_image: "Please upload an image.",
            fail_conn: "Connection failed. Please check your network.",
            fail_analyze: "Image analysis failed. Check server."
        },
        ta: {
            title: "அக்ரோ ஜிபிடி",
            tagline: "உங்கள் விரல் நுனியில் சிறந்த விவசாய அறிவு",
            ask_title: "💬 விவசாய உதவியாளரிடம் கேளுங்கள்",
            placeholder: "இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்? பயிர்கள், மண், பூச்சிகள் பற்றி கேளுங்கள்...",
            btn_ask: "அக்ரோ ஜிபிடியிடம் கேளுங்கள்",
            loading: "🌱 உதவியாளர் யோசிக்கிறார்...",
            response_header: "✨ உதவியாளரின் பதில்",
            scanner_title: "🔍 தாவர நோய் ஸ்கேனர்",
            scanner_desc: "நோய்களைக் கண்டறிந்து இயற்கை/வேதியியல் சிகிச்சை ஆலோசனைகளைப் பெற உங்கள் தாவர இலைகளின் புகைப்படத்தைப் பதிவேற்றவும்.",
            upload_text: "புகைப்படம் எடுக்க அல்லது பதிவேற்ற கிளிக் செய்யவும்",
            upload_hint: "JPG, PNG ஆதரவு (அதிகபட்சம் 16MB)",
            btn_analyze: "✨ நோயை ஆய்வு செய்",
            btn_clear: "🗑️ அழி",
            try_asking: "💡 முயற்சி செய்து பாருங்கள்...",
            ex_ginger: "இயற்கை இஞ்சி",
            ex_pests: "தக்காளி பூச்சிகள்",
            ex_paddy: "நெல் ஊட்டச்சத்து",
            ex_soil: "மண் ஆரோக்கியம்",
            ex_crops: "பருவகால பயிர்கள்",
            pro_tips: "🌟 ப்ரோ டிப்ஸ்",
            tip_photos_title: "தெளிவான புகைப்படங்கள்:",
            tip_photos_desc: "சிறந்த கண்டறிதலுக்கு பாதிக்கப்பட்ட இலைகளின் மேல் மற்றும் கீழ் பகுதியைப் படம் பிடிக்கவும்.",
            tip_voice_title: "குரல் கட்டளைகள்:",
            tip_voice_desc: "ML அல்லது EN ஐக் கிளிக் செய்து, சிறந்த முடிவுகளுக்கு உங்கள் கேள்வியைச் சத்தமாகக் கேளுங்கள்.",
            status_connecting: "இணைக்கிறது...",
            status_ready: "அக்ரோ ஜிபிடி தயார்",
            status_offline: "ஆஃப்லைன்",
            alert_question: "தயவுசெய்து ஒரு கேள்வியை உள்ளிடவும்!",
            alert_image: "தயவுசெய்து ஒரு படத்தைப் பதிவேற்றவும்.",
            fail_conn: "இணைப்பு தோல்வியடைந்தது. உங்கள் பிணையத்தைச் சரிபார்க்கவும்.",
            fail_analyze: "படத்தை ஆய்வு செய்வதில் தோல்வி. சர்வரைச் சரிபார்க்கவும்."
        }
    };

    let currentLang = 'en';

    window.changeLanguage = (lang) => {
        currentLang = lang;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                el.innerText = translations[lang][key];
            }
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (translations[lang][key]) {
                el.placeholder = translations[lang][key];
            }
        });

        // Update document lang
        document.documentElement.lang = lang;

        // Update status text
        checkStatus();
    };

    // --- Status Check ---
    async function checkStatus() {
        try {
            const res = await fetch('/api/status');
            const data = await res.json();
            if (data.model_loaded) {
                statusDot.className = 'status-dot online';
                statusText.textContent = translations[currentLang].status_ready;
            } else {
                statusDot.className = 'status-dot loading';
                statusText.textContent = data.loading_progress || translations[currentLang].status_connecting;
                setTimeout(checkStatus, 2000);
            }
        } catch (e) {
            statusDot.className = 'status-dot';
            statusText.textContent = translations[currentLang].status_offline;
            setTimeout(checkStatus, 5000);
        }
    }
    checkStatus();

    // --- Chat Logic ---
    window.askQuestion = async () => {
        const question = questionInput.value.trim();
        if (!question) return alert(translations[currentLang].alert_question);

        setChatState(true);
        try {
            const res = await fetch('/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question })
            });
            const data = await res.json();
            showResponse(data.answer, !res.ok);
        } catch (e) {
            showResponse(translations[currentLang].fail_conn, true);
        } finally {
            setChatState(false);
        }
    };

    function setChatState(isLoading) {
        askButton.disabled = isLoading;
        chatLoading.classList.toggle('hidden', !isLoading);
        if (isLoading) {
            askButton.innerHTML = `<div class="loading-spinner"></div> ${currentLang === 'ta' ? 'யோசிக்கிறது...' : 'Thinking...'}`;
            responseContainer.classList.remove('show');
        } else {
            askButton.innerHTML = translations[currentLang].btn_ask;
        }
    }

    function showResponse(text, isError = false) {
        responseText.textContent = text;
        responseContainer.classList.add('show');
        responseContainer.style.borderColor = isError ? 'var(--error)' : 'var(--primary)';
        responseContainer.scrollIntoView({ behavior: 'smooth' });
    }

    window.setQuestion = (q) => {
        questionInput.value = q;
        questionInput.focus();
    };

    // --- Vision Logic ---
    uploadArea.onclick = () => imageInput.click();

    imageInput.onchange = (e) => {
        if (e.target.files.length > 0) handleFile(e.target.files[0]);
    };

    uploadArea.ondragover = (e) => { e.preventDefault(); uploadArea.style.borderColor = 'var(--primary)'; };
    uploadArea.ondragleave = () => { uploadArea.style.borderColor = ''; };
    uploadArea.ondrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    };

    function handleFile(file) {
        if (!file.type.startsWith('image/')) return alert(translations[currentLang].alert_image);
        selectedFile = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewContainer.classList.remove('hidden');
            uploadArea.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }

    window.removeImage = () => {
        selectedFile = null;
        previewContainer.classList.add('hidden');
        uploadArea.classList.remove('hidden');
        imageInput.value = '';
    };

    window.analyzeImage = async () => {
        if (!selectedFile) return;

        setVisionState(true);
        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();

            if (res.ok) {
                showResponse(data.analysis);
            } else {
                showResponse(data.error || translations[currentLang].fail_analyze, true);
            }
        } catch (e) {
            showResponse(translations[currentLang].fail_analyze, true);
        } finally {
            setVisionState(false);
        }
    };

    function setVisionState(isLoading) {
        analyzeButton.disabled = isLoading;
        chatLoading.classList.toggle('hidden', !isLoading);
        if (isLoading) {
            analyzeButton.innerHTML = `<div class="loading-spinner"></div> ${currentLang === 'ta' ? 'ஆய்வு செய்கிறது...' : 'Analyzing...'}`;
        } else {
            analyzeButton.innerHTML = translations[currentLang].btn_analyze;
        }
    }

    // --- Voice Logic ---
    window.toggleSpeech = (btnId, lang) => {
        const btn = document.getElementById(btnId);
        if (isRecording) {
            stopSpeech();
        } else {
            startSpeech(btn, lang);
        }
    };

    function startSpeech(btn, lang) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return alert('Speech recognition not supported in this browser.');

        recognition = new SpeechRecognition();
        recognition.lang = lang;
        recognition.onstart = () => {
            isRecording = true;
            btn.classList.add('active');
            btn.innerHTML = '🛑 Stop';
        };
        recognition.onresult = (e) => {
            questionInput.value = e.results[0][0].transcript;
        };
        recognition.onend = () => {
            isRecording = false;
            btn.classList.remove('active');
            if (btn.id === 'micEN') btn.innerHTML = '🎤 EN';
            else if (btn.id === 'micML') btn.innerHTML = '🎤 ML';
            else if (btn.id === 'micTA') btn.innerHTML = '🎤 TA';
        };
        recognition.onerror = stopSpeech;
        recognition.start();
    }

    function stopSpeech() {
        if (recognition) recognition.stop();
    }

    // --- Event Listeners ---
    questionInput.onkeydown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            window.askQuestion();
        }
    };
});
