let habits = JSON.parse(localStorage.getItem('habits')) || [];
let selectedDate = new Date().toISOString().split('T')[0];
document.getElementById('date-input').value = selectedDate;

function addHabit() {
    const input = document.getElementById('habit-input');
    const dateInput = document.getElementById('date-input');
    const dailyToggle = document.getElementById('daily-toggle');
    
    if (input.value.trim() === '') return;

    const newHabit = {
        id: Date.now(),
        text: input.value,
        isDaily: dailyToggle.checked,
        dateCreated: dateInput.value,
        completedDates: [] 
    };

    habits.push(newHabit);
    input.value = '';
    dailyToggle.checked = false;
    saveAndRefresh();
}

function toggleHabit(id) {
    const habit = habits.find(h => h.id === id);
    const index = habit.completedDates.indexOf(selectedDate);
    
    if (index > -1) {
        habit.completedDates.splice(index, 1);
    } else {
        habit.completedDates.push(selectedDate);
    }
    saveAndRefresh();
}

function deleteHabit(id) {
    habits = habits.filter(h => h.id !== id);
    saveAndRefresh();
}

function calculateStreak() {
    let streak = 0;
    let checkDate = new Date();
    
    while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        // Only habits that existed on this date
        const dayHabits = habits.filter(h => 
            (h.isDaily && h.dateCreated <= dateStr) || (!h.isDaily && h.dateCreated === dateStr)
        );
        
        if (dayHabits.length === 0) break;

        const allDone = dayHabits.every(h => h.completedDates.includes(dateStr));

        if (allDone) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            // Allow today to be incomplete
            if (dateStr === new Date().toISOString().split('T')[0]) {
                checkDate.setDate(checkDate.getDate() - 1);
                continue; 
            }
            break; 
        }
    }
    return streak;
}

function saveAndRefresh() {
    localStorage.setItem('habits', JSON.stringify(habits));
    updateUI();
}

function updateUI() {
    const list = document.getElementById('habit-list');
    const dateHeading = document.getElementById('viewing-date');
    list.innerHTML = '';
    
    const currentStreak = calculateStreak();
    dateHeading.innerHTML = `${selectedDate} <br> <span style="color: #ff9800; font-size: 1.2rem;">🔥 Streak: ${currentStreak} Days</span>`;

    const visibleHabits = habits.filter(h => 
        (h.isDaily && h.dateCreated <= selectedDate) || (!h.isDaily && h.dateCreated === selectedDate)
    );

    if (visibleHabits.length === 0) {
        list.innerHTML = '<li style="text-align:center; color:#999; list-style:none; margin-top:10px;">No habits active for this day.</li>';
    }

    visibleHabits.forEach(habit => {
        const isDone = habit.completedDates.includes(selectedDate);
        const li = document.createElement('li');
        li.className = 'habit-item';
        li.innerHTML = `
            <div>
                <input type="checkbox" ${isDone ? 'checked' : ''} onchange="toggleHabit(${habit.id})">
                <span style="${isDone ? 'text-decoration: line-through; color: #aaa' : ''}">
                    ${habit.text} ${habit.isDaily ? '<small>Daily</small>' : ''}
                </span>
            </div>
            <button class="delete-btn" onclick="deleteHabit(${habit.id})">✕</button>
        `;
        list.appendChild(li);
    });

    const hasHabits = visibleHabits.length > 0;
    const allDone = hasHabits && visibleHabits.every(h => h.completedDates.includes(selectedDate));
    document.body.classList.toggle('all-done', allDone);

    renderCalendar();
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    
    for (let i = 1; i <= 28; i++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'day-cell';
        const dayString = `2026-02-${i.toString().padStart(2, '0')}`;
        dayCell.innerText = i;

        const dayHabits = habits.filter(h => 
            (h.isDaily && h.dateCreated <= dayString) || (!h.isDaily && h.dateCreated === dayString)
        );
        const completedCount = dayHabits.filter(h => h.completedDates.includes(dayString)).length;

        if (dayHabits.length > 0) {
            if (completedCount === dayHabits.length) {
                dayCell.classList.add('all-completed');
            } else if (completedCount > 0) {
                dayCell.classList.add('partially-completed');
            }
        }

        if (dayString === selectedDate) dayCell.classList.add('selected');
        dayCell.onclick = () => { selectedDate = dayString; updateUI(); };
        grid.appendChild(dayCell);
    }
}

updateUI();