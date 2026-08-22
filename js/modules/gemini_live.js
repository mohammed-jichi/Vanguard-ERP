window.askVaraAI = async function (userPrompt) {
  const apiKey = localStorage.getItem('so_gemini_api_key') || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        systemInstruction: {
          parts: [{ text: "أنتِ فارا (Vara)، المساعدة الذكية لنظام ERP. أجيبي فوراً باختصار شديد باللغة العربية (جملة واحدة فقط) بدون أي رموز." }]
        }
      })
    });

    const data = await response.json();
    console.log('Gemini API Success Data:', data);

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "أهلاً بك، كيف أساعدك؟";
    return replyText.trim();
  } catch (error) {
    console.error('Network/Fetch Error:', error);
    return "عذراً، حدث خطأ في الاتصال بالإنترنت.";
  }
};

window.GeminiLive = (function () {
  let recognition = null;
  let isLiveActive = false;
  let isListening = false;
  let isSpeaking = false;
  let isProcessing = false;

  let audioContextMic = null;
  let analyserMic = null;
  let micStream = null;
  let animFrameId = null;

  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

  // ERP Tools for Function Calling / Local Queries
  const erpTools = {
    get_stock_level: function (args) {
      const itemName = (args.item_name || args.itemName || '').toLowerCase();
      const catalog = [
        { name: 'Extra Virgin Olive Oil 1L Glass', keywords: ['1l', '1 liter', 'glass', 'زيت 1 لتر', 'زيت زجاج'], stock: 450, unit: 'bottles', price_usd: 12.50 },
        { name: 'Extra Virgin Olive Oil 5L Premium Tin', keywords: ['5l', '5 liter', 'tin', 'تنكة 5', 'زيت 5 لتر'], stock: 220, unit: 'tins', price_usd: 55.00 },
        { name: 'Virgin Olive Oil 16L Bulk Tin', keywords: ['16l', '16 liter', 'bulk', 'تنكة 16', 'تنك كبير'], stock: 85, unit: 'bulk tins', price_usd: 140.00 },
        { name: 'Pomegranate Molasses 500ml', keywords: ['molasses', 'دبس', 'دبس رمان'], stock: 310, unit: 'bottles', price_usd: 6.50 },
        { name: 'Stuffed Eggplant Makdous 1Kg Jar', keywords: ['makdous', 'مكدوس', 'مكدوس باذنجان'], stock: 180, unit: 'jars', price_usd: 15.00 }
      ];

      let matched = catalog.find(c => c.keywords.some(k => itemName.includes(k)) || itemName.includes(c.name.toLowerCase()));
      if (!matched) matched = catalog[0];

      return `يتوفر لدينا حالياً ${matched.stock} ${matched.unit} من ${matched.name} بسعر ${matched.price_usd} دولار.`;
    },

    get_daily_sales: function () {
      return `مجموع مبيعات اليوم بلغ 4,320 دولار أميركي، وهو ما يعادل حوالي 386 مليون ليرة لبنانية من خلال 62 طلبية.`;
    }
  };

  // UI Status Update
  function updateUIState(state, message) {
    const badgeEl = document.getElementById('geminiLiveStatusBadge');
    const btnEl = document.getElementById('geminiLiveToggleBtn');

    if (badgeEl) {
      if (state === 'active') {
        badgeEl.className = 'badge bg-success text-white px-3 py-2 me-2 shadow-sm pulse-animation';
        badgeEl.innerHTML = '<i class="fa-solid fa-waveform fa-beat-fade me-1.5 text-warning"></i> 🟢 Vara Live متصل';
      } else if (state === 'thinking') {
        badgeEl.className = 'badge bg-warning text-dark px-3 py-2 me-2 shadow-sm';
        badgeEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> جاري التفكير والإجابة...';
      } else if (state === 'speaking') {
        badgeEl.className = 'badge bg-info text-dark px-3 py-2 me-2 shadow-sm';
        badgeEl.innerHTML = '<i class="fa-solid fa-volume-high me-1"></i> يتحدث الآن...';
      } else {
        badgeEl.className = 'badge bg-secondary text-white px-3 py-2 me-2 shadow-sm';
        badgeEl.innerHTML = '<i class="fa-solid fa-circle me-1"></i> Vara Live متوقف';
      }
    }

    if (btnEl) {
      if (state === 'active' || state === 'thinking' || state === 'speaking') {
        btnEl.className = 'btn btn-danger fw-bold text-white px-3 shadow-lg';
        btnEl.innerHTML = '<i class="fa-solid fa-phone-slash me-1"></i> إنهاء المكالمة الصوتية';
      } else {
        btnEl.className = 'btn btn-outline-warning fw-bold px-3 shadow-sm';
        btnEl.innerHTML = '<i class="fa-solid fa-headset me-1"></i> Gemini 2.0 Live (Vara)';
      }
    }

    if (message && window.showToast) {
      window.showToast("Vara Live Voice", message, state === 'active' ? 'success' : 'info');
    }
  }

  // Start Real-Time Web Audio Mic Visualizer & Check Permissions
  async function startAudioVisualizer() {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextMic = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextMic.createMediaStreamSource(micStream);
      analyserMic = audioContextMic.createAnalyser();
      analyserMic.fftSize = 64;
      source.connect(analyserMic);

      const bufferLength = analyserMic.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      function updateVolumeVisualizer() {
        if (!isLiveActive) return;
        if (analyserMic) analyserMic.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avgVolume = Math.min(100, Math.round((sum / bufferLength) / 1.2)); // 0 to 100

        // Real-time Visualizer Animation on Button & Badge
        const btnEl = document.getElementById('geminiLiveToggleBtn');
        const badgeEl = document.getElementById('geminiLiveStatusBadge');

        if (btnEl && isLiveActive && !isSpeaking) {
          const scale = 1 + (avgVolume / 600); // Subtle 1.0 to 1.15 scale pulse
          btnEl.style.transform = `scale(${scale})`;
          btnEl.style.boxShadow = avgVolume > 12
            ? `0 0 ${10 + avgVolume / 3}px rgba(239, 68, 68, 0.8)`
            : '0 4px 12px rgba(239, 68, 68, 0.4)';
        }

        if (badgeEl && isLiveActive && !isSpeaking && !isProcessing) {
          badgeEl.innerHTML = '<i class="fa-solid fa-waveform fa-beat-fade me-1.5 text-warning"></i> 🟢 Vara Live متصل';
        }

        animFrameId = requestAnimationFrame(updateVolumeVisualizer);
      }

      updateVolumeVisualizer();
      return true;
    } catch (err) {
      console.warn('[Microphone Permission Denied / Error]', err);
      const permMsg = 'يرجى الضغط على القفل بجانب الرابط والسماح بالميكروفون لاستخدام المكالمة الصوتية 🔒🎙️';
      if (window.showToast) {
        window.showToast("صلاحية الميكروفون محظورة", permMsg, "danger");
      } else {
        alert(permMsg);
      }
      return false;
    }
  }

  function stopAudioVisualizer() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
      micStream = null;
    }
    if (audioContextMic) {
      try { audioContextMic.close(); } catch (e) { }
      audioContextMic = null;
    }
    const btnEl = document.getElementById('geminiLiveToggleBtn');
    if (btnEl) {
      btnEl.style.transform = 'none';
      btnEl.style.boxShadow = 'none';
    }
  }

  // Speak assistant response with Web Speech API (Halts microphone during speech to prevent audio echo loop)
  function speakResponse(text) {
    if (!('speechSynthesis' in window)) {
      restartListeningIfNeeded();
      return;
    }

    // Clean text: strip emojis, asterisks, markdown
    const cleanText = text.replace(/[*#_~`\[\]\(\)]/g, '').replace(/[^\p{L}\p{N}\s.,?!]/gu, '').trim();
    if (!cleanText) {
      restartListeningIfNeeded();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      isSpeaking = true;
      stopRecognitionOnly(); // Stop mic while assistant speaks
      updateUIState('speaking');

      const isArabic = /[\u0600-\u06FF]/.test(cleanText);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = isArabic ? 'ar-SA' : 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices() || [];
      if (isArabic) {
        const arVoice = voices.find(v => v.lang && v.lang.includes('ar'));
        if (arVoice) utterance.voice = arVoice;
      }

      utterance.onstart = function () {
        isSpeaking = true;
        stopRecognitionOnly();
        updateUIState('speaking');
      };

      utterance.onend = function () {
        isSpeaking = false;
        if (isLiveActive) {
          updateUIState('active');
          setTimeout(() => {
            restartListeningIfNeeded();
          }, 300);
        }
      };

      utterance.onerror = function () {
        isSpeaking = false;
        if (isLiveActive) {
          updateUIState('active');
          setTimeout(() => {
            restartListeningIfNeeded();
          }, 300);
        }
      };

      window.speechSynthesis.speak(utterance);
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    } catch (e) {
      console.warn('[Vara Voice Output Warning]', e);
      isSpeaking = false;
      setTimeout(() => {
        restartListeningIfNeeded();
      }, 300);
    }
  }

  // Query Gemini 2.0 Flash REST API
  async function processUserPrompt(userSpokenText) {
    if (!userSpokenText || isProcessing) return;

    const cleanPrompt = userSpokenText.trim();

    isProcessing = true;
    updateUIState('thinking');

    // Pause recognition while thinking & speaking to prevent self-listening
    stopRecognitionOnly();

    const apiKey = localStorage.getItem('so_gemini_api_key') || API_KEY;
    const systemInstructionText = `أنتِ "فارا" (Vara)، المرشدة والمساعدة الذكية لنظام ERP لشركة الزيوت الجنوبية ومعصرة زيت الزيتون ومحطة التكرير.
أجيبي بذكاء وفهم كامل لسؤال المستخدم:
- إذا سأل "كيف أعمل ريبورت أو تقرير؟": اشرحي له بلباقة وسرعة: "يمكنك استخراج التقارير من قائمة التقارير الرئيسية، أو من قسم المبيعات والصندوق لطباعة كشوفات الحركة اليومية".
- إذا سأل عن المبيعات أو المخزون أو الفواتير أو الدعم الفني أجيبي بدقة ووضوح.
- أجيبي دائماً باللغة العربية بأسلوب بشري دافئ وواضح ومختصر (جملتين كحد أقصى) وبدون أي رموز أو نجوم أو تنسيقات ماركداون.`;

    // 1. Display user message in chat UI
    if (typeof window.addMessageToChat === 'function') {
      window.addMessageToChat('user', cleanPrompt);
    }

    try {
      let replyText = await window.askVaraAI(userSpokenText);

      // Fallback to local ERP tool keywords if API return generic error
      if (!replyText || replyText.includes('حدث خطأ')) {
        if (/مخزون|بضاعة|كمية|زيت|مكدوس|stock/i.test(userSpokenText)) {
          replyText = erpTools.get_stock_level({ item_name: userSpokenText });
        } else if (/مبيعات|أرباح|دخل|صندوق|sales/i.test(userSpokenText)) {
          replyText = erpTools.get_daily_sales();
        }
      }

      // 3. Fallback ERP local keywords check
      if (!replyText) {
        if (/مخزون|بضاعة|كمية|زيت|مكدوس|stock/i.test(userSpokenText)) {
          replyText = erpTools.get_stock_level({ item_name: userSpokenText });
        } else if (/مبيعات|أرباح|دخل|صندوق|sales/i.test(userSpokenText)) {
          replyText = erpTools.get_daily_sales();
        } else {
          replyText = "أهلاً بك! أنا فارا، مرشدتك الذكية في النظام، كيف أساعدك؟";
        }
      }

      console.log('🤖 Gemini reply:', replyText);

      // 2. Display assistant message in chat UI
      if (typeof window.addMessageToChat === 'function') {
        window.addMessageToChat('assistant', replyText);
      }

      isProcessing = false;
      speakResponse(replyText);
    } catch (err) {
      console.error('[Vara Live Gemini 2.0 Flash Error]', err);
      isProcessing = false;
      speakResponse("عذراً، حدث خطأ في الاتصال بالذكاء الاصطناعي. تفضل بإعادة سطر سؤالك.");
    }
  }

  // Initialize Speech Recognition
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (window.showToast) window.showToast("خطأ المتصفح", "متصفحك لا يدعم خاصية التعرف على الصوت المباشر Web Speech", "warning");
      return null;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'ar-SA';

    rec.onstart = function () {
      isListening = true;
      updateUIState('active');
    };

    rec.onresult = function (event) {
      if (!isLiveActive || isSpeaking || isProcessing) return;
      const results = event.results;
      if (!results || results.length === 0) return;

      const lastResult = results[results.length - 1];
      if (lastResult.isFinal) {
        const spokenText = lastResult[0].transcript.trim();
        console.log('[Vara Live User Spoken Text]:', spokenText);
        if (spokenText) {
          // Immediately display transcribed text in input box
          const inputEl = document.getElementById('vanguardAiInput');
          if (inputEl) {
            inputEl.value = spokenText;
          }
          processUserPrompt(spokenText);
        }
      }
    };

    rec.onerror = function (event) {
      isListening = false;
      if (event.error === 'aborted' || event.error === 'no-speech') {
        // Normal lifecycle events, do not display error toasts
        return;
      }
      console.warn('Microphone event:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        stopLiveSession();
        const permMsg = 'يرجى الضغط على القفل بجانب الرابط والسماح بالميكروفون 🔒🎙️';
        if (window.showToast) {
          window.showToast("صلاحية الميكروفون محظورة", permMsg, "danger");
        } else {
          alert(permMsg);
        }
      }
    };

    rec.onend = function () {
      isListening = false;
      console.log('[Vara Live STT Ended]');
      if (isLiveActive && !isSpeaking && !isProcessing) {
        setTimeout(() => {
          restartListeningIfNeeded();
        }, 300);
      }
    };

    return rec;
  }

  function restartListeningIfNeeded() {
    if (!isLiveActive || isSpeaking || isProcessing || isListening) return;
    try {
      if (!recognition) recognition = initSpeechRecognition();
      if (recognition && !isListening) {
        recognition.start();
      }
    } catch (e) {
      console.warn('[Vara Live STT Restart Notice]', e);
    }
  }

  function stopRecognitionOnly() {
    isListening = false;
    if (recognition) {
      try { recognition.stop(); } catch (e) { }
    }
  }

  // Start Continuous Voice Live Session
  async function startLiveSession() {
    isLiveActive = true;
    isSpeaking = false;
    isProcessing = false;

    // Check mic permission & start volume visualizer
    const ok = await startAudioVisualizer();
    if (!ok) {
      isLiveActive = false;
      updateUIState('idle');
      return;
    }

    updateUIState('active', 'Vara 2.0 Live نشط ومستعد للحوار الصوتي المستمر! 🎙️⚡');
    restartListeningIfNeeded();
  }

  // Stop Continuous Voice Live Session
  function stopLiveSession() {
    isLiveActive = false;
    isListening = false;
    isSpeaking = false;
    isProcessing = false;

    stopAudioVisualizer();
    stopRecognitionOnly();

    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) { }
    }

    updateUIState('idle', 'تم إنهاء المكالمة الصوتية.');
  }

  // Toggle Live Session
  function toggleLiveSession() {
    if (isLiveActive) {
      stopLiveSession();
    } else {
      startLiveSession();
    }
  }

  return {
    start: startLiveSession,
    stop: stopLiveSession,
    toggle: toggleLiveSession,
    startListening: restartListeningIfNeeded,
    isActive: function () { return isLiveActive; }
  };
})();
