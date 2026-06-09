const supabaseUrl = 'https://jauvcxiasjqdzontmwyi.supabase.co';
const supabaseAnonKey = 'sb_publishable_njR-amwJ98nu7SWeoLYm4A_ozSChP4E';

// Використовуємо іншу назву змінної, щоб не було конфлікту з глобальним об'єктом Supabase
const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

// Приклад того, як ми будемо завантажувати дані пізніше
async function fetchPatients() {
    const { data, error } = await supabaseClient
        .from('patients') // Тобі потрібно буде створити цю таблицю в кабінеті Supabase
        .select('*');
    
    if (error) {
        console.error('Помилка завантаження:', error);
    } else {
        console.log('Дані отримано:', data);
    }
}

// Функція для збереження нового запису в онлайн-базу
async function savePatientToCloud(patient) {
    const { data, error } = await supabaseClient
        .from('patients')
        .insert([patient]);

    if (error) console.error('Помилка збереження:', error);
    return data;
}