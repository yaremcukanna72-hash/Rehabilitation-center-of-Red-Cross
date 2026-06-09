// 1. Отримуємо клієнт з нашого supabaseClient.js
let dailyAppointments = [];

// 2. При завантаженні сторінки ставимо сьогоднішню дату
document.addEventListener("DOMContentLoaded", () => {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('currentDate');
    if (dateInput) {
        dateInput.value = today;
        loadAppointments();
    }
});

// 3. Завантаження записів з Supabase для обраної дати
async function loadAppointments() {
    const selectedDate = document.getElementById('currentDate').value;
    const container = document.getElementById('scheduleList');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center; color:#a4b0be; margin-top:20px;">Завантаження розкладу... 🐾</p>';

    try {
        const { data, error } = await supabaseClient
            .from('appointments')
            .select('*')
            .eq('date', selectedDate)
            .order('time', { ascending: true });

        if (error) throw error;
        
        dailyAppointments = data || [];
        renderAppointments();
    } catch (err) {
        console.error('Помилка завантаження розкладу:', err);
        container.innerHTML = '<p style="text-align:center; color:#ff7675; margin-top:20px;">Помилка хмари. Перевірте з\'єднання. 😿</p>';
    }
}

// 4. Малювання карток на екрані
function renderAppointments() {
    const container = document.getElementById('scheduleList');
    container.innerHTML = '';

    if (dailyAppointments.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#a4b0be; margin-top:20px;">На цю дату поки немає записів.</p>';
        return;
    }

    dailyAppointments.forEach((item, index) => {
        const borderColor = item.type === 'Реабілітація' ? '#00b894' : '#6c5ce7';

        const cardHTML = `
            <div class="appointment-card" style="border-left-color: ${borderColor}">
                <div class="time-tag">${item.time}</div>
                <div class="info">
                    <strong>${item.name}</strong>
                    <div style="font-size: 0.9rem; color: #636e72;">
                        ${item.phone ? '📞 ' + item.phone : ''} 
                        ${item.diag ? ' | 📝 ' + item.diag : ''}
                    </div>
                    <span style="color: ${borderColor}; font-weight: bold;">${item.type}</span>
                </div>
                <button class="btn-del" onclick="deleteAppointment(${item.id})">Видалити</button>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

// 5. Функція додавання нового запису в Supabase
async function addAppointment() {
    const date = document.getElementById('currentDate').value;
    const time = document.getElementById('aTime').value;
    const name = document.getElementById('aName').value.trim();
    const phone = document.getElementById('aPhone').value.trim();
    const diag = document.getElementById('aDiag').value.trim();
    const type = document.getElementById('aType').value;

    if (!date || !time || !name) {
        alert('Мяу! Обов\'язково вкажи час та ім\'я пацієнта! 🐾');
        return;
    }

    const newEntry = { date, time, name, phone, diag, type };

    try {
        const { error } = await supabaseClient
            .from('appointments')
            .insert([newEntry]);

        if (error) throw error;

        // Очищаємо поля
        document.getElementById('aTime').value = '';
        document.getElementById('aName').value = '';
        document.getElementById('aPhone').value = '';
        document.getElementById('aDiag').value = '';
        
        // Оновлюємо список
        loadAppointments();
    } catch (err) {
        console.error('Помилка збереження:', err);
        alert('Не вдалося зберегти запис у хмару 😿');
    }
}

// 6. Функція видалення з Supabase
async function deleteAppointment(id) {
    if (confirm('Точно відмінити цей запис?')) {
        try {
            const { error } = await supabaseClient
                .from('appointments')
                .delete()
                .eq('id', id);

            if (error) throw error;
            loadAppointments();
        } catch (err) {
            console.error('Помилка видалення:', err);
        }
    }
}