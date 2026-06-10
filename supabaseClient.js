const supabaseUrl = 'https://zxkuvtveikixsubizrid.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4a3V2dHZlaWtpeHN1Yml6cmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5ODcxNjMsImV4cCI6MjA5NjU2MzE2M30.E3fDkA9aEvtRn6j6QAhYIS7QsQjs5Ic-2TzjdIPcnKg';

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
