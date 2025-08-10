// Clock elements
let hr = document.querySelector("#hr");
let mn = document.querySelector("#mn");
let sc = document.querySelector("#sc");
let clockFace = document.querySelector("#clockFace");
let timeDisplay = document.querySelector("#time");
let alarmStatus = document.querySelector("#alarmStatus");
let testAlarmBtn = document.querySelector("#testAlarmBtn");
let toggleAlarmBtn = document.querySelector("#toggleAlarmBtn");

// Alarm state variables
let isAlarmActive = false;
let alarmEnabled = true;
let alarmInterval = null;
let audioContext = null;
let audioInitialized = false;

// Initialize audio context
function initAudioContext() {
    if (!audioInitialized) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioInitialized = true;
            console.log("Audio context initialized successfully");
        } catch (error) {
            console.log("Audio context initialization failed:", error);
        }
    }
}

// Create beep sound using Web Audio API
function createBeep() {
    if (!audioContext || !audioInitialized) {
        console.log("Audio context not available");
        return;
    }

    try {
        // Resume audio context if suspended
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Set frequency and type
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.type = 'sine';
        
        // Set volume envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        // Start and stop the beep
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        
        console.log("Beep sound played");
    } catch (error) {
        console.log("Error creating beep:", error);
    }
}

// Alternative beep using HTML5 Audio with generated sound
function createAlternativeBeep() {
    try {
        // Create a simple beep using data URL
        const audio = new Audio();
        audio.src = "data:audio/wav;base64,UklGRhYBAABXQVZFZm10IBAAAAABAAEAgD4AAIA+AAABAAgAZGF0YfIAAACAhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvGIaBDqM0fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvGIaBDqM0fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvGIaBDqM0fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvGIaBDqM0fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvGIaBDqM0fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvGIaBDqM0fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvGIaBDqM0fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvGIaBDqM0fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvGIaBDqM0fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvGIaBDqM0fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvGIaBDqM0fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvGIaBDqM0fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvGIaBDqM0fLNeSsF";
        audio.volume = 0.5;
        audio.play().catch(error => {
            console.log("Alternative beep failed:", error);
        });
    } catch (error) {
        console.log("Alternative beep creation failed:", error);
    }
}

// Play alarm sound with fallbacks
function playAlarmSound() {
    console.log("Attempting to play alarm sound...");
    
    // Try Web Audio API first
    if (audioContext && audioInitialized) {
        createBeep();
    } else {
        // Fallback to HTML5 Audio
        createAlternativeBeep();
    }
}

// Start alarm
function startAlarm() {
    if (!isAlarmActive && alarmEnabled) {
        isAlarmActive = true;
        clockFace.classList.add('alarm-active');
        timeDisplay.classList.add('alarm-active');
        alarmStatus.classList.add('active');
        alarmStatus.textContent = "🚨 ALARM: Last 10 seconds of 5-minute interval!";
        
        console.log("Alarm started!");
        
        // Play sound immediately
        playAlarmSound();
        
        // Continue playing sound every 500ms
        alarmInterval = setInterval(() => {
            if (isAlarmActive) {
                playAlarmSound();
            }
        }, 500);
    }
}

// Stop alarm
function stopAlarm() {
    if (isAlarmActive) {
        isAlarmActive = false;
        clockFace.classList.remove('alarm-active');
        timeDisplay.classList.remove('alarm-active');
        alarmStatus.classList.remove('active');
        alarmStatus.textContent = alarmEnabled ? "5-Minute Interval Alarm: Ready" : "5-Minute Interval Alarm: Disabled";
        
        if (alarmInterval) {
            clearInterval(alarmInterval);
            alarmInterval = null;
        }
        
        console.log("Alarm stopped!");
    }
}

// Check if alarm should be active
function checkAlarmCondition(minutes, seconds) {
    if (!alarmEnabled) return;
    
    // Check if we're in the last 10 seconds of any 5-minute interval
    // 5-minute intervals: 00, 05, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55
    const minutesMod5 = minutes % 5;
    
    // Alarm should be active during seconds 50-59 of minutes ending in 4
    // (which leads to the next 5-minute mark: 0, 5, 10, 15, etc.)
    const shouldAlarm = (minutesMod5 === 4 && seconds >= 50);
    
    if (shouldAlarm && !isAlarmActive) {
        startAlarm();
    } else if (!shouldAlarm && isAlarmActive) {
        stopAlarm();
    }
}

// Toggle alarm on/off
function toggleAlarm() {
    alarmEnabled = !alarmEnabled;
    
    if (alarmEnabled) {
        toggleAlarmBtn.textContent = "Disable Alarm";
        toggleAlarmBtn.classList.remove('disabled');
        alarmStatus.textContent = "5-Minute Interval Alarm: Ready";
        console.log("Alarm enabled");
    } else {
        toggleAlarmBtn.textContent = "Enable Alarm";
        toggleAlarmBtn.classList.add('disabled');
        alarmStatus.textContent = "5-Minute Interval Alarm: Disabled";
        stopAlarm(); // Stop any active alarm
        console.log("Alarm disabled");
    }
}

// Test alarm function
function testAlarm() {
    console.log("Testing alarm sound...");
    initAudioContext();
    
    // Play test beep
    playAlarmSound();
    
    // Visual feedback for test
    clockFace.classList.add('alarm-active');
    timeDisplay.classList.add('alarm-active');
    alarmStatus.classList.add('active');
    alarmStatus.textContent = "🔊 Testing alarm sound...";
    
    // Remove visual effects after 2 seconds
    setTimeout(() => {
        if (!isAlarmActive) { // Only remove if no real alarm is active
            clockFace.classList.remove('alarm-active');
            timeDisplay.classList.remove('alarm-active');
            alarmStatus.classList.remove('active');
            alarmStatus.textContent = alarmEnabled ? "5-Minute Interval Alarm: Ready" : "5-Minute Interval Alarm: Disabled";
        }
    }, 2000);
}

// Main clock update function
function updateClock() {
    let day = new Date();
    let hh = day.getHours() * 30;
    let mm = day.getMinutes() * 6;
    let ss = day.getSeconds() * 6;
    
    // Update clock hands
    hr.style.transform = `rotateZ(${hh + (mm / 12)}deg)`;
    mn.style.transform = `rotateZ(${mm}deg)`;
    sc.style.transform = `rotateZ(${ss}deg)`;
    
    // Get time values
    let h = day.getHours();
    let m = day.getMinutes();
    let s = day.getSeconds();
    
    // Check alarm condition
    checkAlarmCondition(m, s);
    
    // Format time for display
    let am = h >= 12 ? "PM" : "AM";
    
    if (h > 12) {
        h = h - 12;
    }
    if (h === 0) {
        h = 12;
    }
    
    h = (h < 10) ? "0" + h : h;
    m = (m < 10) ? "0" + m : m;
    s = (s < 10) ? "0" + s : s;
    
    // Update display
    document.getElementById("hours").innerHTML = h;
    document.getElementById("minutes").innerHTML = m;
    document.getElementById("seconds").innerHTML = s;
    document.getElementById("ampm").innerHTML = am;
}

// Event listeners
testAlarmBtn.addEventListener('click', testAlarm);
toggleAlarmBtn.addEventListener('click', toggleAlarm);

// Initialize audio on user interaction
document.addEventListener('click', function initAudio() {
    initAudioContext();
}, { once: true });

// Initialize audio on any user interaction
document.addEventListener('touchstart', function initAudioTouch() {
    initAudioContext();
}, { once: true });

// Start the clock
setInterval(updateClock, 1000);

// Initial clock update
updateClock();

console.log("Clock initialized with alarm functionality!");
