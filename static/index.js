
document.addEventListener('DOMContentLoaded', () => {
    // Auth Modal Logic
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
    let currentUser = null;

    async function checkAuthStatus() {
        try {
            const res = await fetch('/api/user');
            const data = await res.json();
            
            isLoggedIn = data.logged_in;
            currentUser = data;
            
            const btn = document.getElementById('authHeaderBtn');
            const outBtn = document.getElementById('logoutHeaderBtn');
            if (isLoggedIn) {
                if(btn) btn.classList.add('hidden');
                if(outBtn) outBtn.classList.remove('hidden');
                outBtn.title = "Logout " + data.full_name;
            } else {
                if(btn) btn.classList.remove('hidden');
                if(outBtn) outBtn.classList.add('hidden');
            }
        } catch (e) { console.error(e); }
    }
    checkAuthStatus();

    window.submitLogin = async () => {
        const email = document.getElementById('authLoginEmail').value;
        const password = document.getElementById('authLoginPassword').value;
        const btn = document.getElementById('authLoginBtn');
        
        if(!email || !password) return alert('Email and password required');
        
        btn.innerHTML = 'Logging in...';
        btn.disabled = true;
        
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                closeAuthModal();
                checkAuthStatus();
            } else {
                alert(data.error);
            }
        } catch (e) {
            alert('Connection failed');
        } finally {
            btn.innerHTML = 'Login';
            btn.disabled = false;
        }
    };

    window.submitRegister = async () => {
        const full_name = document.getElementById('authRegName').value;
        const profession = document.getElementById('authRegProfession').value;
        const email = document.getElementById('authRegEmail').value;
        const password = document.getElementById('authRegPassword').value;
        const btn = document.getElementById('authRegBtn');
        
        if(!email || !password || !full_name || !profession) return alert('All fields required');
        
        btn.innerHTML = 'Creating...';
        btn.disabled = true;
        
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, full_name, profession })
            });
            const data = await res.json();
            if (res.ok) {
                closeAuthModal();
                checkAuthStatus();
            } else {
                alert(data.error);
            }
        } catch (e) {
            alert('Connection failed');
        } finally {
            btn.innerHTML = 'Create Account';
            btn.disabled = false;
        }
    };

    window.logoutUser = async () => {
        try {
            await fetch('/api/logout', { method: 'POST' });
            checkAuthStatus();
        } catch (e) { console.error(e); }
    };

    // Chat Logic
    window.askQuestion = async () => {
        const qInput = document.getElementById('questionInput');
        const question = qInput ? qInput.value.trim() : "";
        if (!question) return alert("Please enter a question.");
        
        const btn = document.getElementById('askButton');
        btn.innerHTML = 'Thinking...';
        btn.disabled = true;
        
        try {
            const res = await fetch('/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: question, district: '' })
            });
            const data = await res.json();
            showResponse(data.answer, !res.ok);
        } catch (e) {
            showResponse("Connection failed. Please check server.", true);
        } finally {
            btn.innerHTML = 'Ask AgroGPT';
            btn.disabled = false;
        }
    };

    function showResponse(text, isError) {
        const rc = document.getElementById('responseContainer');
        const rt = document.getElementById('responseText');
        if(!rc || !rt) return;
        rc.style.display = 'block';
        rt.innerText = text;
        if(isError) rc.style.borderLeftColor = 'red';
        else rc.style.borderLeftColor = '#006e2f';
    }

    // Vision Logic
    let selectedFile = null;
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const previewContainer = document.getElementById('previewContainer');
    const previewImg = document.getElementById('previewImg');
    
    if(uploadArea && imageInput) {
        uploadArea.onclick = () => {
            if (!isLoggedIn) return openAuthModal();
            imageInput.click();
        };

        imageInput.onchange = (e) => {
            if (e.target.files.length > 0) handleFile(e.target.files[0]);
        };

        uploadArea.ondragover = (e) => { e.preventDefault(); };
        uploadArea.ondrop = (e) => {
            e.preventDefault();
            if (!isLoggedIn) return openAuthModal();
            if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
        };
    }

    function handleFile(file) {
        if (!file.type.startsWith('image/')) return alert('Please upload an image.');
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
        if(previewContainer) previewContainer.classList.add('hidden');
        if(uploadArea) uploadArea.classList.remove('hidden');
        if(imageInput) imageInput.value = '';
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

            if (res.ok) {
                showResponse(data.analysis);
            } else {
                showResponse(data.error || "Image analysis failed.", true);
            }
        } catch (e) {
            showResponse("Connection failed.", true);
        } finally {
            btn.innerHTML = 'Analyze';
            btn.disabled = false;
        }
    };
});
