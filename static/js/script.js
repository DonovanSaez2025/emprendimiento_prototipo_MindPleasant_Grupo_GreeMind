/* MindPleasant - lógica compartida para todas las páginas */
(function() {
    'use strict';

    const STORAGE_KEY = 'mindpleasant_entries';

    // Emociones disponibles (en el orden de la pantalla de selección) con su categoría
    const EMOTIONS = [
        ['😁', 'positiva'],
        ['😀', 'positiva'],
        ['😊', 'positiva'],
        ['😐', 'neutra'],
        ['😑', 'neutra'],
        ['😣', 'ansiedad'],
        ['🙄', 'enojo'],
        ['😕', 'neutra'],
        ['🥺', 'tristeza'],
        ['😔', 'tristeza'],
        ['😞', 'tristeza'],
        ['😓', 'tristeza'],
        ['😩', 'ansiedad'],
        ['😫', 'ansiedad'],
        ['😭', 'tristeza'],
        ['😰', 'ansiedad'],
        ['😲', 'ansiedad'],
        ['😨', 'ansiedad'],
        ['😠', 'enojo'],
        ['😡', 'enojo'],
        ['🤬', 'enojo'],
        ['👿', 'enojo'],
        ['🤒', 'malestar'],
        ['🤕', 'malestar'],
        ['🤢', 'malestar']
    ];

    // Categorías extra para emojis usados en la línea de tiempo de ejemplo
    const EXTRA_CATEGORY = { '😥': 'tristeza' };

    const ANALYSIS = {
        positiva: 'Me alegra que hoy te sientas bien. Aprovecha este momento: anota qué lo hizo posible (personas, hábitos, lugares) para poder volver a ello en los días más difíciles. Compartir tu alegría con alguien cercano también la multiplica.',
        neutra: 'Sentirse “normal” o sin una emoción marcada también es válido. Puede ser un buen momento para escucharte con calma: ¿qué necesitas hoy? Un paseo corto, hablar con alguien o descansar pueden ayudarte a conectar con lo que sientes.',
        tristeza: 'Sé que es difícil pasar por eso, pero debes saber que no estás solo/a y que lo que sientes es válido. Permítete expresar la tristeza sin juzgarte, apóyate en las personas que te quieren y recuerda que las emociones intensas con el tiempo van cambiando. Poco a poco, y a tu ritmo, podrás seguir adelante.',
        ansiedad: 'Parece que estás pasando por un momento de mucha tensión. Prueba a respirar lento: inhala 4 segundos, sostén 4 y exhala 6, durante unos minutos. Poner tus preocupaciones por escrito y dividirlas en pasos pequeños puede devolverte la sensación de control.',
        enojo: 'Es natural sentir enojo cuando algo nos parece injusto o nos supera. Antes de reaccionar, date unos minutos: respira, aléjate de la situación si puedes y mueve el cuerpo. Cuando te calmes, identifica qué necesidad hay detrás del enojo para poder expresarla con claridad.',
        malestar: 'Tu cuerpo y tu mente están conectados, y hoy parece que te piden descanso. Hidrátate, duerme lo suficiente y no te exijas de más. Si el malestar físico continúa, consulta con un profesional de la salud.'
    };

    /* ---------- Utilidades ---------- */
    function categoryOf(emoji) {
        const found = EMOTIONS.find(function(e) { return e[0] === emoji; });
        return found ? found[1] : (EXTRA_CATEGORY[emoji] || 'neutra');
    }

    function loadEntries() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) { /* ignorar */ }
        return null;
    }

    function saveEntries(list) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) { /* ignorar */ }
    }

    function seedEntries() {
        // Datos de ejemplo para ver la línea de tiempo la primera vez
        const demo = [
            ['2026-10-02', '😭'],
            ['2026-10-03', '😭'],
            ['2026-10-04', '😥'],
            ['2026-10-05', '😥'],
            ['2026-10-06', '😔'],
            ['2026-10-07', '😐'],
            ['2026-10-08', '😊']
        ].map(function(d, i) {
            return { id: 'demo-' + i, date: d[0], emoji: d[1], note: '' };
        });
        saveEntries(demo);
        return demo;
    }

    function getEntries() {
        return loadEntries() || seedEntries();
    }

    function formatDate(iso) {
        const p = iso.split('-');
        return p[2] + '/' + p[1] + '/' + p[0];
    }

    function todayISO() {
        const d = new Date();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return d.getFullYear() + '-' + mm + '-' + dd;
    }

    /* ---------- Página: selección de emoción ---------- */
    function initEmotionPage() {
        const grid = document.getElementById('emoji-grid');
        const note = document.getElementById('note');
        const msg = document.getElementById('msg');
        const btn = document.getElementById('save-btn');
        let selected = null;

        EMOTIONS.forEach(function(e) {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'emoji-btn';
            b.textContent = e[0];
            b.setAttribute('role', 'radio');
            b.setAttribute('aria-checked', 'false');
            b.setAttribute('aria-label', 'Emoción ' + e[0]);
            b.addEventListener('click', function() {
                grid.querySelectorAll('.emoji-btn').forEach(function(x) {
                    x.classList.remove('selected');
                    x.setAttribute('aria-checked', 'false');
                });
                b.classList.add('selected');
                b.setAttribute('aria-checked', 'true');
                selected = e[0];
                msg.textContent = '';
            });
            grid.appendChild(b);
        });

        btn.addEventListener('click', function() {
            if (!selected) {
                msg.textContent = 'Por favor, selecciona una emoción primero.';
                return;
            }
            const entries = getEntries();
            const entry = {
                id: 'e-' + Date.now(),
                date: todayISO(),
                emoji: selected,
                note: note.value.trim()
            };
            // Una emoción por día: reemplaza la del mismo día
            const idx = entries.findIndex(function(x) { return x.date === entry.date; });
            if (idx >= 0) entries[idx] = entry;
            else entries.push(entry);
            entries.sort(function(a, b) { return a.date.localeCompare(b.date); });
            saveEntries(entries);
            window.location.href = 'static/html/analisis.html?id=' + encodeURIComponent(entry.id);
        });
    }

    /* ---------- Página: premium ---------- */
    function initPremiumPage() {
        const msg = document.getElementById('msg');
        document.getElementById('buy-btn').addEventListener('click', function() {
            msg.textContent = 'El pago aún no está disponible en esta versión de demostración.';
        });
    }

    /* ---------- Página: línea de tiempo ---------- */
    function initTimelinePage() {
        const container = document.getElementById('timeline');
        const entries = getEntries().slice().sort(function(a, b) { return a.date.localeCompare(b.date); });

        if (!entries.length) {
            container.innerHTML = '<p class="empty">Aún no hay registros. ¡Selecciona tu primera emoción!</p>';
            return;
        }

        entries.forEach(function(en) {
            const day = document.createElement('div');
            day.className = 'day';

            const date = document.createElement('div');
            date.className = 'day-date';
            date.textContent = formatDate(en.date);

            const emoji = document.createElement('div');
            emoji.className = 'day-emoji';
            emoji.textContent = en.emoji;

            const link = document.createElement('button');
            link.type = 'button';
            link.className = 'day-link';
            link.textContent = 'ver resumen';
            link.addEventListener('click', function() {
                window.location.href = 'static/html/analisis.html?id=' + encodeURIComponent(en.id);
            });

            day.appendChild(date);
            day.appendChild(emoji);
            day.appendChild(link);
            container.appendChild(day);
        });

        // Mostrar los días más recientes al final
        const scroller = container.parentElement;
        scroller.scrollLeft = scroller.scrollWidth;
    }

    /* ---------- Página: análisis completo ---------- */
    function initAnalysisPage() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        const entries = getEntries();
        const entry = entries.find(function(e) { return e.id === id; }) || entries[entries.length - 1];

        const emotionEl = document.getElementById('emotion');
        const analysisEl = document.getElementById('analysis');
        const noteEl = document.getElementById('user-note');

        if (entry) {
            emotionEl.textContent = entry.emoji;
            analysisEl.textContent = ANALYSIS[categoryOf(entry.emoji)];
            if (entry.note) noteEl.textContent = 'Tu nota (' + formatDate(entry.date) + '): “' + entry.note + '”';
        } else {
            analysisEl.textContent = 'No hay registros para analizar todavía.';
        }

        const modal = document.getElementById('modal');
        document.getElementById('contact-btn').addEventListener('click', function() {
            modal.classList.add('open');
        });
        document.getElementById('modal-close').addEventListener('click', function() {
            modal.classList.remove('open');
        });
        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.classList.remove('open');
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') modal.classList.remove('open');
        });
    }

    /* ---------- Arranque ---------- */
    document.addEventListener('DOMContentLoaded', function() {
        const page = document.body.getAttribute('data-page');
        if (page === 'emocion') initEmotionPage();
        else if (page === 'premium') initPremiumPage();
        else if (page === 'timeline') initTimelinePage();
        else if (page === 'analisis') initAnalysisPage();
    });
})();