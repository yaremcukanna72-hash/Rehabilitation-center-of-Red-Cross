let patients = [];

async function fetchPatients() {
    try {
        const { data, error } = await supabaseClient
            .from('patients')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            console.error('Помилка завантаження:', error);
            // Спробуємо завантажити з локальної пам'яті, якщо хмара не відповідає
            patients = JSON.parse(localStorage.getItem('medicalRecords')) || [];
        } else {
            patients = data || [];
        }
        render();
    } catch (err) {
        console.error('Критична помилка:', err);
        patients = JSON.parse(localStorage.getItem('medicalRecords')) || [];
        render();
    }
}

function render() {
    const tbody = document.querySelector('#patientTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    patients.forEach((p, index) => {
        const isRehab = p.status === 'Реабілітація';
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
                <button class="btn-action btn-delete" onclick="remove(${p.id || null}, ${index})">✕</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function addPatient() {
    const name = document.getElementById('pName').value.trim();
    const phone = document.getElementById('pPhone').value.trim();
    const diagnosis = document.getElementById("pDiagnosis").value.trim();
    const status = document.getElementById("pStatus").value;

    if (name && phone) {
        const newPatient = { name, phone, diagnosis, status };
        
        try {
            const { data, error } = await supabaseClient
                .from('patients')
                .insert([newPatient])
                .select();
            
            if (error) {
                alert('Помилка Supabase: ' + error.message + '\nПеревір, чи створена таблиця "patients"!');
                throw error;
            }
            
            if (data && data[0]) {
                patients.unshift(data[0]);
                render();
            }
        } catch (err) {
            console.error('Помилка збереження:', err);
            // Якщо не вдалося в хмару, збережемо хоча б локально
            patients.unshift({ ...newPatient, id: Date.now() });
            localStorage.setItem('medicalRecords', JSON.stringify(patients));
            render();
        }

        // Очистка
        document.getElementById('pName').value = '';
        document.getElementById('pPhone').value = '';
        document.getElementById('pDiagnosis').value = '';
    } else {
        alert('Мяу! Треба заповнити ім\'я та телефон пацієнта :3');
    }
}

async function toggle(index) {
    const p = patients[index];
    const newStatus = (p.status === 'Консультація') ? 'Реабілітація' : 'Консультація';
    
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
        alert('Не вдалося змінити статус: ' + err.message);
    }
}

async function remove(id, index) {
    if (confirm('Видалити цей запис?')) {
        try {
            if (id) {
                const { error } = await supabaseClient
                    .from('patients')
                    .delete()
                    .eq('id', id);
                if (error) throw error;
            }
            patients.splice(index, 1);
            localStorage.setItem('medicalRecords', JSON.stringify(patients));
            render();
        } catch (err) {
            alert('Помилка видалення: ' + err.message);
        }
    }
}

fetchPatients();