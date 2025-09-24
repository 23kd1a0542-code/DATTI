let currentUser  = null;
let voiceEnabled = true;
let gameLevel = 1;
let gameScore = 0;
let progress = 0;
let badges = [];
let userLocation = null;

// Quiz questions
let quizQuestions = [
    { q: "What to do in earthquake?", a: "Drop, Cover, Hold On", options: ["Run", "Drop, Cover, Hold On", "Hide under bed"] },
    { q: "What number do you call for fire emergency?", a: "101", options: ["100", "101", "108"] },
    { q: "What should you do during a flood?", a: "Move to higher ground", options: ["Swim in water", "Move to higher ground", "Stay in basement"] },
    { q: "What is the safest place during a thunderstorm?", a: "Indoors away from windows", options: ["Under a tree", "Indoors away from windows", "On the roof"] },
    { q: "What to do if you smell gas?", a: "Open windows and leave", options: ["Light a match", "Open windows and leave", "Ignore it"] }
];

// Unique question for each class 1-5
const classQuestions = {
    1: [
        {
            question: "Class 1: What should you do if you feel an earthquake while in class?",
            options: ["Run outside", "Hide under your desk", "Stand near windows"],
            answer: "Hide under your desk"
        }
    ],
    2: [
        {
            question: "Class 2: If there is a fire drill, what should you do first?",
            options: ["Shout loudly", "Follow your teacher", "Hide in the bathroom"],
            answer: "Follow your teacher"
        }
    ],
    3: [
        {
            question: "Class 3: What number do you call for fire emergency?",
            options: ["100", "101", "108"],
            answer: "101"
        }
    ],
    4: [
        {
            question: "Class 4: If you see flood water, what should you do?",
            options: ["Play in the water", "Stay away and inform adults", "Jump in"],
            answer: "Stay away and inform adults"
        }
    ],
    5: [
        {
            question: "Class 5: During a disaster, why is it important to stay calm?",
            options: [
                "So you can think clearly and follow instructions",
                "To make others laugh",
                "So you can run faster"
            ],
            answer: "So you can think clearly and follow instructions"
        }
    ]
};

// --- LOGIN/SIGNUP ---
function showSignup() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('signupScreen').classList.remove('hidden');
    speak("Welcome to the sign up page. Please create your account.");
}

function showLogin() {
    document.getElementById('signupScreen').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    speak("Welcome to the login page. Please enter your username and password.");
}

function signup() {
    const username = document.getElementById('newUsername').value.trim();
    const password = document.getElementById('newPassword').value.trim();
    if (!username || !password) {
        speak('Please enter username and password.');
        alert('Please enter username and password.');
        return;
    }
    let users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username]) {
        speak('Username already exists.');
        alert('Username already exists.');
        return;
    }
    users[username] = { password: password };
    localStorage.setItem('users', JSON.stringify(users));
    speak('Account created! Please sign in.');
    alert('Account created! Please sign in.');
    showLogin();
}

function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Demo credentials
    if (username === "student" && password === "pass123") {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        speak("Welcome to Disaster Prep Portal! You are now logged in.");
        return;
    }

    // Check localStorage users
    let users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username] && users[username].password === password) {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        speak("Welcome, " + username + "! You are now logged in.");
    } else {
        speak("Invalid username or password. Try student pass one two three for demo or sign up.");
        alert("Invalid username or password. Try student / pass123 for demo or sign up.");
    }
}

function logout() {
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    speak("You have been logged out. Please login again to continue.");
}

// --- NAVIGATION ---
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(function(s) {
        s.classList.add('hidden');
    });
    var section = document.getElementById(sectionId);
    if (section) section.classList.remove('hidden');
    let messages = {
        home: "This is your dashboard. Explore disaster safety tips and your progress.",
        emergency: "Here are emergency contacts for Punjab.",
        quizzes: "Test your disaster knowledge with quizzes.",
        games: "Play disaster safety games for your class.",
        hackathon: "Welcome to Hackathon Mode. Solve disaster scenarios by making quick decisions.",
        advanced: "Try the advanced real-time disaster simulation.",
        videos: "Watch disaster safety videos and learn how to stay safe."
    };
    if (messages[sectionId]) speak(messages[sectionId]);
    if (sectionId === 'quizzes') {
        startQuiz();
    }
    if (sectionId === 'videos') {
        renderVideos();
    }
    if (sectionId === 'hackathon') {
        // Optionally, speak a hackathon intro here
        speak("Hackathon Mode started. Select your class and begin solving disaster scenarios.");
    }
}

function toggleVoice() {
    voiceEnabled = !voiceEnabled;
    alert('Voice is now ' + (voiceEnabled ? 'ON' : 'OFF'));
}

function speak(text) {
    if (!voiceEnabled) return;
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1;
        utter.pitch = 1;
        window.speechSynthesis.speak(utter);
    }
}

function shareContacts() {
    const contacts = 'NDMA: 011-26701700\nPunjab: 0172-2740271';
    navigator.clipboard.writeText(contacts).then(() => alert('Contacts copied! Share with parents.'));
}

// --- QUIZ ---
function startQuiz() {
    let questions = shuffle([...quizQuestions]);
    let score = 0;
    let current = 0;
    showQuestion();

    function showQuestion() {
        if (current >= questions.length) {
            document.getElementById('quizContent').innerHTML = `
                <div class="score-badge">
                    <span>🏅</span>
                    <div>Your Score: <b>${score}/${questions.length}</b></div>
                </div>
            `;
            updateProgressBar(score, questions.length);
            addBadge(score >= 4 ? "Quiz Master" : "Quiz Participant");
            checkAchievements();
            return;
        }
        const q = questions[current];
        speak(q.q);
        let html = `<p><b>${q.q}</b></p>`;
        q.options.forEach(function(opt) {
            html += `<button class="quiz-btn" onclick="window.checkAnswerQuiz('${opt}')">${opt}</button><br>`;
        });
        document.getElementById('quizContent').innerHTML = html;
    }

    window.checkAnswerQuiz = function(selected) {
        const q = questions[current];
        if (selected === q.a) {
            speak("Correct answer! Well done.");
        } else {
            speak("Wrong answer. Try again.");
        }
        current++;
        setTimeout(showQuestion, 700);
    };
}

function updateProgressBar(score, total) {
    const percent = Math.round((score / total) * 100);
    document.getElementById('progress').textContent = percent + "%";
    document.getElementById('progressFill').style.width = percent + "%";
}

// --- GAME ---
function startGame() {
    const classLevel = document.getElementById('classLevel').value;
    const questions = classQuestions[classLevel];
    if (!questions) {
        document.getElementById('gameArea').innerHTML = "No questions for this class.";
        return;
    }
    let current = 0;
    let score = 0;

    const environments = {
        1: {
            intro: "Floods are rising! Choose the right action to stay safe.",
            success: "<span style='color:green;font-size:1.2em;'>🛟 You are safe from the flood!</span>",
            fail: "<div class='disaster-anim flood'><span>🌊</span><br><b>You sank in the flood!</b></div>"
        },
        2: {
            intro: "The ground is shaking! Pick the correct action to escape the earthquake.",
            success: "<span style='color:green;font-size:1.2em;'>🏃‍♂️ You escaped the earthquake safely!</span>",
            fail: "<div class='disaster-anim quake'><span>🌋</span><br><b>You got trapped in the earthquake!</b></div>"
        },
        3: {
            intro: "A fire has broken out! Choose the right emergency number.",
            success: "<span style='color:green;font-size:1.2em;'>🚒 Firefighters are on the way!</span>",
            fail: "<div class='disaster-anim fire'><span>🔥</span><br><b>You couldn't call for help in time!</b></div>"
        },
        4: {
            intro: "Flood waters are everywhere! What should you do?",
            success: "<span style='color:green;font-size:1.2em;'>🚧 You avoided the flood danger!</span>",
            fail: "<div class='disaster-anim flood'><span>🌊</span><br><b>You got caught in the flood!</b></div>"
        },
        5: {
            intro: "A disaster is happening! Why should you stay calm?",
            success: "<span style='color:green;font-size:1.2em;'>😌 You stayed calm and handled the disaster!</span>",
            fail: "<div class='disaster-anim panic'><span>😱</span><br><b>You panicked and made mistakes!</b></div>"
        }
    };

    document.getElementById('gameArea').innerHTML = `<p>${environments[classLevel].intro}</p>`;
    setTimeout(showQuestion, 1200);

    function showQuestion() {
        const q = questions[current];
        let html = `<p><b>${q.question}</b></p>`;
        q.options.forEach(function(opt) {
            html += `<button class="quiz-btn" onclick="window.answerGame('${opt}')">${opt}</button><br>`;
        });
        document.getElementById('gameArea').innerHTML = html;
    }

    window.answerGame = function(selected) {
        const q = questions[current];
        if (selected === q.answer) {
            score++;
            document.getElementById('gameArea').innerHTML = environments[classLevel].success;
            speak("Correct! You survived the disaster.");
        } else {
            document.getElementById('gameArea').innerHTML = environments[classLevel].fail;
            speak("Wrong! You faced the disaster.");
        }
        document.getElementById('gameScore').textContent = `Score: ${score}`;
        setTimeout(function() {
            current++;
            if (current < questions.length) {
                showQuestion();
            } else {
                document.getElementById('gameArea').innerHTML += "<br><b>Game Over!</b>";
                updateLeaderboard(currentUser || 'Anonymous', score);
            }
        }, 1500);
    };

    document.getElementById('gameScore').textContent = `Score: ${score}`;
    document.getElementById('levelProgress').textContent = `Level: ${classLevel}/5`;
}

// --- ADVANCED SIMULATION ---
function startAdvancedSimulation() {
    const simQuestion = document.getElementById('simQuestion');
    const simFeedback = document.getElementById('simFeedback');
    const realMap = document.getElementById('realMap');
    const safePlaces = document.getElementById('safePlaces');
    simQuestion.textContent = "🌊 Flood Alert! Your area is at risk. What will you do to stay safe?";
    simFeedback.innerHTML = `
        <b>Directions:</b>
        <ul>
            <li>🚶‍♂️ <b>Move to the highest safe place</b> (terrace or upper floor).</li>
            <li>🚫 <b>Avoid basements and low-lying areas.</b></li>
            <li>🎒 Keep emergency supplies with you.</li>
            <li>🆘 Wait for rescue teams if needed.</li>
        </ul>
        <b>Safe places:</b> 🏫 Terrace, upper floors, schools, hospitals, police stations, shelters<br>
        <b>Unsafe places:</b> 🚫 Basement, ground floor, garage
    `;
    speak("Flood alert! Move to the highest safe place in your house, such as the terrace or upper floor. Avoid basements and low-lying areas. You can also go to the nearest school, hospital, police station, or shelter.");
    realMap.innerHTML = '';
    safePlaces.innerHTML = '';

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            realMap.innerHTML = `<div id="leafletMap" style="width:100%;height:300px;border-radius:12px;overflow:hidden;"></div>`;

            const map = L.map('leafletMap').setView([lat, lon], 16);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            const userIcon = L.divIcon({
                className: 'sim-user-marker',
                html: `<div style="font-size:2em;filter:drop-shadow(0 2px 6px #36d1c4aa);">📍</div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
            });
            const marker = L.marker([lat, lon], { icon: userIcon }).addTo(map);
            marker.bindPopup('<b>📍 You are here!</b><br>Stay alert and move to a safe place.').openPopup();

            safePlaces.innerHTML = `
                <b>Find nearest safe places in your area:</b><br>
                <a href="https://www.google.com/maps/search/school/@${lat},${lon},15z" target="_blank">🏫 Schools</a>
                <a href="https://www.google.com/maps/search/hospital/@${lat},${lon},15z" target="_blank">🏥 Hospitals</a>
                <a href="https://www.google.com/maps/search/police+station/@${lat},${lon},15z" target="_blank">🚓 Police Stations</a>
                <a href="https://www.google.com/maps/search/shelter/@${lat},${lon},15z" target="_blank">🏠 Shelters</a>
            `;
        }, function(error) {
            simFeedback.innerHTML += "<br><b>Unable to access your location. Please allow location access in your browser.</b>";
            speak("Unable to access your location. Please allow location access in your browser.");
        });
    } else {
        simFeedback.innerHTML += "<br><b>Geolocation is not supported by your browser.</b>";
        speak("Geolocation is not supported by your browser.");
    }
}

// --- YOUTUBE VIDEOS ---
// Public, embeddable, easy-access disaster videos:
const disasterVideos = [
    {
        id: "dKQnG7Vw3xw",
        title: "Disaster Preparedness for Kids"
    },
    {
        id: "w7VwBqRr1nA",
        title: "Flood Safety Tips"
    },
    {
        id: "lA3r4K8Q93E",
        title: "Earthquake Safety Tips"
    }
];

function renderVideos() {
    var grid = document.getElementById('videoGrid');
    grid.innerHTML = "";
    disasterVideos.forEach(function(video) {
        var card = document.createElement('div');
        card.className = "video-card";
        card.innerHTML = `
            <div class="video-title">
                <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank" rel="noopener">
                    ${video.title}
                </a>
            </div>
        `;
        grid.appendChild(card);
    });
}

// --- UTILITY ---
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- BADGES & ACHIEVEMENTS (stub functions) ---
function addBadge(name) {
    if (!badges.includes(name)) {
        badges.push(name);
        document.getElementById('badgeList').innerHTML += `<span>${name}</span>`;
    }
}
function checkAchievements() {
    if (gameScore >= 5 && !badges.includes('Disaster Hero')) {
        addBadge('Disaster Hero');
        alert('Achievement unlocked: Disaster Hero!');
    }
}

// --- LEADERBOARD ---
function updateLeaderboard(username, score) {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    leaderboard.push({ username, score, date: new Date().toLocaleString() });
    leaderboard = leaderboard.sort(function(a, b) { return b.score - a.score; }).slice(0, 10);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function showLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    let html = "<h3>Leaderboard</h3><ol>";
    leaderboard.forEach(function(entry) {
        html += `<li>${entry.username || 'Anonymous'}: ${entry.score} pts <span style="font-size:0.8em;color:#888;">(${entry.date})</span></li>`;
    });
    html += "</ol>";
    document.getElementById('home').innerHTML += html;
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('dashboard')) showLeaderboard();
});

// Hackathon Mode Game for Classes 6-10
const hackathonQuestions = {
    6: [
        {
            scenario: "A flood warning has been issued for your area. What should you do first?",
            options: ["Go outside to watch", "Move valuables to higher ground", "Ignore the warning"],
            answer: "Move valuables to higher ground"
        }
    ],
    7: [
        {
            scenario: "During an earthquake, you are in a classroom. What is the safest action?",
            options: ["Run outside", "Hide under a sturdy desk", "Stand near windows"],
            answer: "Hide under a sturdy desk"
        }
    ],
    8: [
        {
            scenario: "A fire breaks out in your school. What should you do?",
            options: ["Call 101 and evacuate calmly", "Hide in the restroom", "Shout and panic"],
            answer: "Call 101 and evacuate calmly"
        }
    ],
    9: [
        {
            scenario: "You see someone injured during a disaster. What is your first step?",
            options: ["Call for help and give first aid", "Take a photo", "Run away"],
            answer: "Call for help and give first aid"
        }
    ],
    10: [
        {
            scenario: "After a disaster, what is most important?",
            options: ["Check for injuries and hazards", "Post on social media", "Go back to sleep"],
            answer: "Check for injuries and hazards"
        }
    ]
};

function startHackathonGame() {
    var classLevel = document.getElementById('hackathonClass').value;
    var questions = hackathonQuestions[classLevel];
    var current = 0;
    var score = 0;
    var gameArea = document.getElementById('hackathonGameArea');
    var scoreDisplay = document.getElementById('hackathonScore');
    if (!questions) {
        gameArea.innerHTML = "No hackathon questions for this class.";
        return;
    }
    showScenario();

    function showScenario() {
        var q = questions[current];
        var html = `<p><b>${q.scenario}</b></p>`;
        q.options.forEach(function(opt) {
            html += `<button class="quiz-btn" onclick="window.answerHackathon('${opt}')">${opt}</button><br>`;
        });
        gameArea.innerHTML = html;
    }

    window.answerHackathon = function(selected) {
        var q = questions[current];
        if (selected === q.answer) {
            score++;
            gameArea.innerHTML = `<span style='color:green;font-size:1.2em;'>✅ Correct! Good decision.</span>`;
        } else {
            gameArea.innerHTML = `<span style='color:red;font-size:1.2em;'>❌ Incorrect. Think again!</span>`;
        }
        scoreDisplay.textContent = `Score: ${score}`;
        setTimeout(function() {
            current++;
            if (current < questions.length) {
                showScenario();
            } else {
                gameArea.innerHTML += "<br><b>Hackathon Over!</b>";
            }
        }, 1200);
    };
}

// Supported languages and translations
const translations = {
    en: {
        home: "Welcome to Disaster Prep Portal",
        emergency: "Emergency Contacts (Punjab)",
        quizzes: "Disaster Quizzes",
        games: "Games for Classes 1-5 (Drag & Drop)",
        hackathon: "Hackathon Mode Game (Classes 6-10)",
        advanced: "Real-Time Location-Based Simulation",
        videos: "Disaster Safety: Watch & Learn",
        login: "Disaster Prep Login",
        signup: "Sign Up",
        logout: "Logout",
        voice: "Voice Guide",
        selectClass: "Select your class:",
        startGame: "Start Game",
        startHackathon: "Start Hackathon Game",
        startSimulation: "Start Simulation"
    },
    hi: {
        home: "आपका स्वागत है Disaster Prep Portal में",
        emergency: "आपातकालीन संपर्क (पंजाब)",
        quizzes: "आपदा क्विज़",
        games: "कक्षा 1-5 के लिए खेल (ड्रैग एंड ड्रॉप)",
        hackathon: "हैकथॉन मोड गेम (कक्षा 6-10)",
        advanced: "रीयल-टाइम स्थान आधारित सिमुलेशन",
        videos: "आपदा सुरक्षा: देखें और सीखें",
        login: "डिजास्टर प्रेप लॉगिन",
        signup: "साइन अप",
        logout: "लॉगआउट",
        voice: "वॉयस गाइड",
        selectClass: "अपनी कक्षा चुनें:",
        startGame: "खेल शुरू करें",
        startHackathon: "हैकथॉन गेम शुरू करें",
        startSimulation: "सिमुलेशन शुरू करें"
    },
    mr: {
        home: "Disaster Prep Portal मध्ये स्वागत आहे",
        emergency: "आपत्कालीन संपर्क (पंजाब)",
        quizzes: "आपत्ती क्विझ",
        games: "इयत्ता 1-5 साठी खेळ (ड्रॅग आणि ड्रॉप)",
        hackathon: "हॅकथॉन मोड गेम (इयत्ता 6-10)",
        advanced: "रिअल-टाइम स्थान आधारित सिम्युलेशन",
        videos: "आपत्ती सुरक्षा: पहा आणि शिका",
        login: "डिझास्टर प्रेप लॉगिन",
        signup: "साइन अप",
        logout: "लॉगआउट",
        voice: "व्हॉइस गाइड",
        selectClass: "तुमची इयत्ता निवडा:",
        startGame: "खेळ सुरू करा",
        startHackathon: "हॅकथॉन गेम सुरू करा",
        startSimulation: "सिम्युलेशन सुरू करा"
    },
    es: {
        home: "Bienvenido al Portal de Preparación para Desastres",
        emergency: "Contactos de emergencia (Punjab)",
        quizzes: "Cuestionarios de desastres",
        games: "Juegos para clases 1-5 (Arrastrar y soltar)",
        hackathon: "Modo Hackathon (Clases 6-10)",
        advanced: "Simulación basada en ubicación en tiempo real",
        videos: "Seguridad ante desastres: Mira y aprende",
        login: "Inicio de sesión de preparación para desastres",
        signup: "Registrarse",
        logout: "Cerrar sesión",
        voice: "Guía de voz",
        selectClass: "Selecciona tu clase:",
        startGame: "Iniciar juego",
        startHackathon: "Iniciar Hackathon",
        startSimulation: "Iniciar simulación"
    },
    te: {
        home: "Disaster Prep Portal కి స్వాగతం",
        emergency: "అత్యవసర సంప్రదింపులు (Punjab)",
        quizzes: "ప్రమాదాల క్విజ్‌లు",
        games: "తరగతి 1-5 కోసం ఆటలు (డ్రాగ్ & డ్రాప్)",
        hackathon: "హాకథాన్ మోడ్ గేమ్ (తరగతి 6-10)",
        advanced: "రియల్-టైమ్ స్థాన ఆధారిత అనుకరణ",
        videos: "ప్రమాద భద్రత: చూడండి మరియు నేర్చుకోండి",
        login: "Disaster Prep లాగిన్",
        signup: "సైన్ అప్",
        logout: "లాగ్ అవుట్",
        voice: "వాయిస్ గైడ్",
        selectClass: "మీ తరగతి ఎంచుకోండి:",
        startGame: "ఆట ప్రారంభించండి",
        startHackathon: "హాకథాన్ ప్రారంభించండి",
        startSimulation: "అనుకరణ ప్రారంభించండి"
    }
};

let currentLanguage = "en";

function setLanguage(lang) {
    currentLanguage = lang;
    updateUITranslations();
}

function t(key) {
    return translations[currentLanguage][key] || translations["en"][key] || key;
}

// Update UI text for selected language
function updateUITranslations() {
    // Example: update section headings and buttons
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    // You can add more UI updates here as needed
}

// Call updateUITranslations() after DOMContentLoaded and after language change
document.addEventListener('DOMContentLoaded', updateUITranslations);
speak(t('login'));
document.getElementById('quizContent').innerHTML = `<h2>${t('quizzes')}</h2>`;