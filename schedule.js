let dailyAppointments = [];

document.addEventListener("DOMContentLoaded", () => {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('currentDate');
    if (dateInput) {
        dateInput.value = today;
        loadAppointments();
    }
});

async function loadAppointments() {
    const selectedDate = document.getElementById('currentDate').value;
    const container = document.getElementById('scheduleList');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center; color:#a4b0be; margin-top:20px;">Завантаження... 🐾</p>';

    try {
        const { data, error } = await supabaseClient
            .from('appointments')
            .select('*')
            .eq('date', selectedDate)
            .order('time', { ascending: true });

        if (error) {
            alert('Помилка завантаження розкладу: ' + error.message);
            throw error;
        }
        
        dailyAppointments = data || [];
        renderAppointments();
    } catch (err) {
        console.error('Помилка:', err);
        container.innerHTML = '<p style="text-align:center; color:#ff7675; margin-top:20px;">Помилка підключення. 😿</p>';
    }
}

function renderAppointments() {
    const container = document.getElementById('scheduleList');
    container.innerHTML = '';

    if (dailyAppointments.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#a4b0be; margin-top:20px;">На цю дату поки немає записів.</p>';
        return;
    }

    dailyAppointments.forEach((item) => {
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

        if (error) {
            alert('Помилка запису в розклад: ' + error.message);
            throw error;
        }

        // Очищаємо
        document.getElementById('aTime').value = '';
        document.getElementById('aName').value = '';
        document.getElementById('aPhone').value = '';
        document.getElementById('aDiag').value = '';
        
        loadAppointments();
    } catch (err) {
        console.error('Помилка збереження:', err);
    }
}

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
            alert('Помилка видалення: ' + err.message);
        }
    }
}