const textarea = document.querySelector("#text");
const voicelist = document.querySelector("#voice");
const speechbtn = document.querySelector(".submit");

let synth = speechSynthesis;
let isSpeaking = false; // Отслеживает, активно ли воспроизведение (true если говорит, false если нет или на паузе)

// --- Загрузка голосов ---
// Функция для заполнения выпадающего списка доступными голосами
function populateVoiceList() {
    // Очищаем список перед заполнением, чтобы избежать дублирования
    voicelist.innerHTML = '';

    for (let voice of synth.getVoices()) {
        let option = document.createElement("option");
        option.textContent = voice.name; // Используем textContent для установки текста
        option.setAttribute('data-lang', voice.lang); // Можно добавить язык как data-атрибут
        option.setAttribute('data-name', voice.name); // Имя голоса
        voicelist.appendChild(option);
    }
}

// Слушаем событие, когда список голосов становится доступным
// Это важно, так как голоса загружаются асинхронно
synth.addEventListener("voiceschanged", populateVoiceList);

// Вызываем функцию сразу на случай, если голоса уже загружены к этому моменту
populateVoiceList();

// --- Преобразование текста в речь ---
// Функция для непосредственного произнесения текста
function speakText(text) {
    // Если уже что-то говорится, останавливаем
    if (synth.speaking) {
        synth.cancel();
    }

    let utterance = new SpeechSynthesisUtterance(text);

    // Устанавливаем выбранный голос
    // Находим голос по имени, которое хранится в value <option>
    let selectedVoice = synth.getVoices().find(voice => voice.name === voicelist.value);
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    // Обработчики событий для отслеживания состояния речи
    utterance.onstart = () => {
        isSpeaking = true;
        speechbtn.innerHTML = "Pause Speech";
    };

    utterance.onend = () => {
        isSpeaking = false;
        speechbtn.innerHTML = "Convert To Speech"; // Возвращаем исходный текст кнопки
    };

    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        isSpeaking = false;
        speechbtn.innerHTML = "Convert To Speech";
    };

    synth.speak(utterance);
}

// --- Обработка нажатия кнопки ---
speechbtn.addEventListener("click", (e) => {
    e.preventDefault(); // Предотвращаем стандартное действие кнопки (например, отправку формы)

    // Если поле текста пустое, ничего не делаем
    if (textarea.value.trim() === "") {
        return;
    }

    // Логика кнопки: пауза/возобновление/начало речи
    if (synth.speaking) { // Если в данный момент что-то говорится
        if (isSpeaking) { // Если кнопка показывает "Pause Speech"
            synth.pause();
            isSpeaking = false;
            speechbtn.innerHTML = "Resume Speech";
        } else { // Если кнопка показывает "Resume Speech"
            synth.resume();
            isSpeaking = true;
            speechbtn.innerHTML = "Pause Speech";
        }
    } else { // Если ничего не говорится, начинаем новую речь
        speakText(textarea.value);
    }
});

// Добавим обработчик на событие `end` для `synth`,
// чтобы кнопка корректно возвращалась в исходное состояние,
// даже если речь была отменена или завершилась по другим причинам.
synth.onend = () => {
    if (isSpeaking) { // Проверяем, что состояние было "говорящим"
        isSpeaking = false;
        speechbtn.innerHTML = "Convert To Speech";
    }
};
