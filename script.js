// Використовуємо клієнт з нашого supabaseClient.js
let patients = [];

// 1. Завантаження даних з Supabase
async function fetchPatients() {
    try {
        const { data, error } = await supabaseClient
            .from('patients')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;
        
        patients = data || [];
        render();
    } catch (err) {
        console.error('Помилка завантаження з хмари:', err);
        // Якщо хмара недоступна, беремо з пам'яті браузера
        patients = JSON.parse(localStorage.getItem('medicalRecords')) || [];
        render();
    }
}

// 2. Малювання таблиці
function render() {
    const tbody = document.querySelector('#patientTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    patients.forEach((p, index) => {
        const isRehab = p.status === 'Реабилитація';
        const row = document.createElement('tr');

        row.innerHTML = `
            <td data-label="Пацієнт"><strong>${p.name}</strong></td>
            <td data-label="Телефон">${p.phone || '-'}</td>
            <td data-label="Діагноз">${p.diagnosis || '-'}</td>
            <td data-label="Статус">
                <span class="badge ${isRehab ? 'status-rehab' : 'status-consult'}">${p.status}</span>
            </td>
            <td data-label="Дії">
                <button class="btn-action btn-status" onclick="toggle(${index})">Змінити статус</button>
                <button class="btn-action btn-delete" onclick="remove(${p.id || index}, ${index})">✕</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 3. Додавання пацієнта
async function addPatient() {
    const name = document.getElementById('pName').value;
    const phone = document.getElementById('pPhone').value;
    const diagnosis = document.getElementById("pDiagnosis").value;
    const status = document.getElementById("pStatus").value;

    if (name.trim() && phone.trim()) {
        const newPatient = { name, phone, diagnosis, status };
        
        // Відправляємо в Supabase
        try {
            const { data, error } = await supabaseClient
                .from('patients')
                .insert([newPatient])
                .select();
            
            if (error) throw error;
            
            // Додаємо в локальний список для швидкості
            patients.unshift(data[0]);
        } catch (err) {
            console.error('Помилка збереження в хмару:', err);
            // Запасний варіант - локальна пам'ять
            patients.unshift(newPatient);
            localStorage.setItem('medicalRecords', JSON.stringify(patients));
        }

        render();
        // Очистка полей
        document.getElementById('pName').value = '';
        document.getElementById('pPhone').value = '';
        document.getElementById('pDiagnosis').value = '';
    } else {
        alert('Мяу! Треба заповнити ім\'я та телефон пацієнта :3');
    }
}

// 4. Зміна статусу
async function toggle(index) {
    const p = patients[index];
    const newStatus = (p.status === 'Консультація') ? 'Реабилитація' : 'Консультація';
    
    try {
        if (p.id) {
            const { error } = await supabaseClient
                .from('patients')
                .update({ status: newStatus })
                .eq('id', p.id);
            if (error) throw error;
        }
        patients[index].status = newStatus;
        render();
    } catch (err) {
        console.error('Помилка оновлення:', err);
    }
}

// 5. Видалення
async function remove(id, index) {
    if (confirm('Видалити цей запис?')) {
        try {
            if (id && patients[index].id) {
                const { error } = await supabaseClient
                    .from('patients')
                    .delete()
                    .eq('id', id);
                if (error) throw error;
            }
            patients.splice(index, 1);
            render();
        } catch (err) {
            console.error('Помилка видалення:', err);
        }
    }
}

// Старт
fetchPatients();