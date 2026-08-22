/**
 * VANGUARD ERP - UNIFIED VOICE & CHAT AI ASSISTANT (VARA)
 * Single source of truth for Speech-to-Text, Gemini AI API, and Text-to-Speech
 */

const VanguardAI = (function () {
  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
  let recognition = null;
  let isListening = false;
  let isSpeaking = false;

  // Initialize Speech Recognition
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser.');
      return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      isListening = true;
      updateUIStatus('🟢 أستمع إليك...');
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript.trim();
      if (!transcript) return;
      console.log('🎤 User said:', transcript);
      await processUserQuery(transcript);
    };

    recognition.onerror = (event) => {
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      console.warn('Speech Recognition error:', event.error);
      updateUIStatus('⚪ المساعد جاهز');
    };

    recognition.onend = () => {
      isListening = false;
      if (!isSpeaking) {
        updateUIStatus('⚪ المساعد جاهز');
      }
    };
  }
  // Query Google Gemini API
  async function fetchAIResponse(promptText) {
    // تعريف المفتاح والرابط الجديد مباشرة هنا لضمان عدم ضياع السيرفر
    // تعريف المفتاح والرابط الجديد مباشرة هنا لضمان عدم ضياع السيرفر //
    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    try {
      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: promptText }] }],
          systemInstruction: {
            parts: [{
              text: "أنتِ فارا (Vara)، المساعدة الذكية المتحدثة بالصوت لنظام ERP لإدارة منتوجات الزيتون والعمليات. أجيبي فوراً بذكاء ولباقة على كلام المستخدم باللغة العربية باختصار شديد (جملة أو جملتين فقط) وبدون أي رموز ماركداون أو إيموجي لتكون الإجابة مناسبة للنطق الصوتي."
            }]
          }
        })
      });

      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "أهلاً بك، كيف أساعدك في النظام؟";
    } catch (err) {
      console.error('Gemini API Error:', err);
      return "عذراً، حدث خطأ في الاتصال بالإنترنت، يرجى المحاولة مجدداً.";
    }
  }

  // Play Native Speech
  function speakResponse(text) {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const clean = text.replace(/[*#_~`\[\]\(\)\{\}]/g, '').replace(/[^\p{L}\p{N}\s.,?!]/gu, '').trim();
    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'ar-SA';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      isSpeaking = true;
      updateUIStatus('🔊 فارا تتحدث...');
    };

    utterance.onend = () => {
      isSpeaking = false;
      updateUIStatus('⚪ المساعد جاهز');
    };

    utterance.onerror = () => {
      isSpeaking = false;
      updateUIStatus('⚪ المساعد جاهز');
    };

    window.speechSynthesis.speak(utterance);
  }

  // Central Processing Handler
  async function processUserQuery(text) {
    if (!text || !text.trim()) return;

    appendMessageToUI('user', text);
    updateUIStatus('⏳ جاري التفكير...');

    const aiReply = await fetchAIResponse(text);
    appendMessageToUI('assistant', aiReply);
    speakResponse(aiReply);
  }

  // Controls
  function startListening() {
    if (!recognition || isListening || isSpeaking) return;
    try {
      recognition.start();
    } catch (e) {
      console.warn('Recognition start error:', e);
    }
  }

  function stopListening() {
    if (recognition && isListening) {
      recognition.stop();
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    isSpeaking = false;
    isListening = false;
    updateUIStatus('⚪ متوقف');
  }

  // UI Helpers (Connect to existing modal elements)
  function appendMessageToUI(sender, text) {
    const chatContainer = document.querySelector('#ai-chat-messages, .chat-messages-container');
    if (!chatContainer) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = sender === 'user'
      ? 'flex justify-end my-2'
      : 'flex justify-start my-2';

    msgDiv.innerHTML = `
      <div class="${sender === 'user' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-100 border border-slate-700'} p-3 rounded-xl max-w-[85%] text-sm shadow" style="color: #ffffff !important; font-size: 1.05rem !important; font-weight: 600 !important;">
        ${text}
      </div>
    `;
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function updateUIStatus(statusText) {
    const statusBadge = document.querySelector('#vara-live-status, .ai-status-badge');
    if (statusBadge) {
      statusBadge.textContent = statusText;
    }
  }

  // Modal open/close helpers
  function createModalDOMIfMissing() {
    let modal = document.querySelector('#vanguard-ai-modal, #vanguardAiModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'vanguard-ai-modal';
      modal.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); z-index: 99999; align-items: center; justify-content: center;';
      modal.innerHTML = `
        <div style="background: #0f172a; border: 1px solid rgba(245, 158, 11, 0.5); border-radius: 1.25rem; width: 92%; max-width: 520px; padding: 1.5rem; color: #f8fafc; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7);">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 1rem; margin-bottom: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(to top right, #d97706, #fbbf24); display: flex; align-items: center; justify-content: center; font-weight: bold; color: #020617; font-size: 1.2rem;">
                V
              </div>
              <div>
                <h3 style="font-weight: bold; font-size: 1.15rem; color: #fbbf24; margin: 0;">فارا (Vara) — المساعدة الذكية</h3>
                <span id="vara-live-status" style="font-size: 0.82rem; color: #94a3b8;">⚪ المساعد جاهز</span>
              </div>
            </div>
            <button onclick="closeVanguardAiAssistant()" style="background: none; border: none; color: #94a3b8; font-size: 1.8rem; cursor: pointer; line-height: 1;">&times;</button>
          </div>
          <div id="ai-chat-messages" style="height: 260px; overflow-y: auto; padding: 0.75rem; background: rgba(2, 6, 23, 0.7); border-radius: 0.75rem; border: 1px solid #1e293b; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: flex-start; margin: 0.5rem 0;">
              <div style="background: #1e293b; color: #ffffff !important; padding: 0.75rem 1rem; border-radius: 0.75rem; max-width: 85%; font-size: 1rem; font-weight: 600;">
                أهلاً بك! أنا فارا المساعدة الذكية لمؤسسة منتوجات زيت وزيتون الجنوب. كيف يمكنني مساعدتك اليوم؟
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
            <button id="vara-call-toggle-btn" style="flex: 1; padding: 0.7rem 1rem; border-radius: 0.75rem; background: #f59e0b; font-weight: bold; color: #020617; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 1rem;">
              🎙️ بدء المكالمة الصوتية
            </button>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <input type="text" id="ai-user-input" placeholder="اكتب سؤالك هنا..." style="flex: 1; background: #1e293b; border: 1px solid #334155; border-radius: 0.75rem; padding: 0.6rem 1rem; color: #f8fafc; font-size: 0.95rem;" />
            <button id="ai-send-btn" style="padding: 0.6rem 1.25rem; background: #f59e0b; color: #020617; border-radius: 0.75rem; border: none; font-weight: bold; cursor: pointer;">
              إرسال
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      wireModalEvents();
    }
    return modal;
  }

  function createFloatingButtonIfMissing() {
    let btn = document.querySelector('#vara-floating-trigger-btn, button[onclick*="openVanguardAiAssistant"]');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'vara-floating-trigger-btn';
      btn.title = 'فارا — المساعد الصوتي الذكي';
      btn.onclick = openModal;
      btn.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 99999; border-radius: 50%; width: 62px; height: 62px; background: linear-gradient(135deg, #f59e0b, #d97706); color: #020617; border: 2px solid #fbbf24; box-shadow: 0 10px 30px rgba(245, 158, 11, 0.6); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;';
      btn.innerHTML = `<i class="fa-solid fa-microphone" style="font-size: 1.6rem; color: #020617;"></i>`;
      btn.onmouseover = () => { btn.style.transform = 'scale(1.1)'; };
      btn.onmouseout = () => { btn.style.transform = 'scale(1)'; };
      document.body.appendChild(btn);
    } else {
      btn.onclick = openModal;
    }
  }

  function openModal() {
    const modal = createModalDOMIfMissing();
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.setProperty('display', 'flex', 'important');
    }
  }

  function closeModal() {
    const modal = document.querySelector('#vanguard-ai-modal, #vanguardAiModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.setProperty('display', 'none', 'important');
    }
    stopListening();
  }

  function wireModalEvents() {
    const closeBtn = document.querySelector('#close-ai-modal-btn');
    if (closeBtn) closeBtn.onclick = closeModal;

    const sendBtn = document.querySelector('#ai-send-btn');
    const inputField = document.querySelector('#ai-user-input');

    if (sendBtn && inputField) {
      const handleSend = () => {
        const val = inputField.value.trim();
        if (val) {
          inputField.value = '';
          processUserQuery(val);
        }
      };

      sendBtn.onclick = handleSend;
      inputField.onkeypress = (e) => {
        if (e.key === 'Enter') handleSend();
      };
    }

    const callToggleBtn = document.querySelector('#vara-call-toggle-btn');
    if (callToggleBtn) {
      callToggleBtn.onclick = () => {
        if (isListening || isSpeaking) {
          stopListening();
          callToggleBtn.textContent = '📞 بدء المكالمة الصوتية';
        } else {
          startListening();
          callToggleBtn.textContent = '❌ إنهاء المكالمة';
        }
      };
    }
  }

  // Initialize on load
  document.addEventListener('DOMContentLoaded', () => {
    initSpeechRecognition();
    createFloatingButtonIfMissing();
    wireModalEvents();
  });

  // Also create floating button immediately if script runs after body loaded
  if (document.body) {
    createFloatingButtonIfMissing();
  }

  return {
    openModal,
    closeModal,
    startListening,
    stopListening,
    sendQuery: processUserQuery
  };
})();

window.VanguardAI = VanguardAI;
window.openVanguardAiAssistant = VanguardAI.openModal;
window.closeVanguardAiAssistant = VanguardAI.closeModal;


