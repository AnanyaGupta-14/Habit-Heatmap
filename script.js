let habits = JSON.parse(localStorage.getItem("habits")) || [];

let currentDate = new Date();

let selectedDate = null;

const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const habitInput = document.getElementById("habitInput");
const habitList = document.getElementById("habitList");
const error = document.getElementById("error");

const modal = document.getElementById("habitModal");
const selectedDateElement = document.getElementById("selectedDate");
const habitChecklist = document.getElementById("habitChecklist");

const totalHabitsElement = document.getElementById("totalHabits");
const completedCountElement = document.getElementById("completedCount");
const completionRateElement = document.getElementById("completionRate");

displayHabits();
renderCalendar();
updateStats();

function addHabit() {

    const name = habitInput.value.trim();

    if (name === "") {
        error.textContent = "Please enter a habit.";
        return;
    }

    habits.push({
        id: Date.now(),
        name: name,
        completedDates: []
    });

    habitInput.value = "";

    error.textContent = "";

    saveHabits();

    displayHabits();

    renderCalendar();

    updateStats();
}

function displayHabits() {

    habitList.innerHTML = "";

    if (habits.length === 0) {
        return;
    }

    const list = document.createElement("div");

    list.className = "habit-list";

    habits.forEach(function(habit) {

        const tag = document.createElement("div");

        tag.className = "habit-tag";

        tag.innerHTML = `
            <span>🌱 ${habit.name}</span>

            <button
                class="delete-habit"
                onclick="deleteHabit(${habit.id})"
            >
                ×
            </button>
        `;

        list.appendChild(tag);
    });

    habitList.appendChild(list);
}

function deleteHabit(id) {

    habits = habits.filter(function(habit) {
        return habit.id !== id;
    });

    saveHabits();

    displayHabits();

    renderCalendar();

    updateStats();
}

function renderCalendar() {

    calendar.innerHTML = "";

    const year = currentDate.getFullYear();

    const month = currentDate.getMonth();

    const monthName = currentDate.toLocaleString(
        "default",
        {
            month: "long"
        }
    );

    monthYear.textContent =
        `${monthName} ${year}`;

    const firstDay =
        new Date(year, month, 1).getDay();

    const daysInMonth =
        new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {

        const emptyDay =
            document.createElement("div");

        emptyDay.className =
            "calendar-day empty";

        calendar.appendChild(emptyDay);
    }

    for (let day = 1; day <= daysInMonth; day++) {

        const calendarDay =
            document.createElement("div");

        const dateString =
            formatDate(year, month, day);

        const completedCount =
            getCompletedCount(dateString);

        const level =
            getHeatmapLevel(completedCount);

        calendarDay.className =
            `calendar-day level-${level}`;

        if (isToday(year, month, day)) {
            calendarDay.classList.add("today");
        }

        calendarDay.innerHTML = `
            <span class="day-number">
                ${day}
            </span>

            ${
                completedCount > 0
                ?
                `<span class="day-count">
                    ${completedCount}/${habits.length}
                </span>`
                :
                ""
            }
        `;

        calendarDay.onclick = function() {
            openModal(dateString);
        };

        calendar.appendChild(calendarDay);
    }
}

function formatDate(year, month, day) {

    const date =
        new Date(year, month, day);

    const yearValue =
        date.getFullYear();

    const monthValue =
        String(date.getMonth() + 1).padStart(2, "0");

    const dayValue =
        String(date.getDate()).padStart(2, "0");

    return `${yearValue}-${monthValue}-${dayValue}`;
}

function getCompletedCount(dateString) {

    let count = 0;

    habits.forEach(function(habit) {

        if (
            habit.completedDates &&
            habit.completedDates.includes(dateString)
        ) {
            count++;
        }
    });

    return count;
}

function getHeatmapLevel(count) {

    if (count === 0) {
        return 0;
    }

    if (count === 1) {
        return 1;
    }

    if (count === 2) {
        return 2;
    }

    if (count === 3) {
        return 3;
    }

    return 4;
}

function openModal(dateString) {

    selectedDate = dateString;

    const date =
        new Date(dateString + "T00:00:00");

    selectedDateElement.textContent =
        date.toLocaleDateString(
            "default",
            {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );

    habitChecklist.innerHTML = "";

    if (habits.length === 0) {

        habitChecklist.innerHTML = `
            <p>
                Add some habits first.
            </p>
        `;

        modal.classList.add("active");

        return;
    }

    habits.forEach(function(habit) {

        const isCompleted =
            habit.completedDates.includes(
                dateString
            );

        const item =
            document.createElement("div");

        item.className = "check-item";

        item.innerHTML = `
            <input
                type="checkbox"
                id="habit-${habit.id}"
                ${isCompleted ? "checked" : ""}
            >

            <label for="habit-${habit.id}">
                ${habit.name}
            </label>
        `;

        habitChecklist.appendChild(item);
    });

    modal.classList.add("active");
}

function saveDay() {

    if (selectedDate === null) {
        return;
    }

    habits.forEach(function(habit) {

        const checkbox =
            document.getElementById(
                `habit-${habit.id}`
            );

        if (!checkbox) {
            return;
        }

        const index =
            habit.completedDates.indexOf(
                selectedDate
            );

        if (
            checkbox.checked &&
            index === -1
        ) {

            habit.completedDates.push(
                selectedDate
            );
        }

        if (
            !checkbox.checked &&
            index !== -1
        ) {

            habit.completedDates.splice(
                index,
                1
            );
        }
    });

    saveHabits();

    closeModal();

    renderCalendar();

    updateStats();
}

function closeModal() {

    modal.classList.remove("active");

    selectedDate = null;
}

function previousMonth() {

    currentDate.setMonth(
        currentDate.getMonth() - 1
    );

    renderCalendar();
}

function nextMonth() {

    currentDate.setMonth(
        currentDate.getMonth() + 1
    );

    renderCalendar();
}

function goToToday() {

    currentDate = new Date();

    renderCalendar();
}

function isToday(year, month, day) {

    const today = new Date();

    return (
        year === today.getFullYear() &&
        month === today.getMonth() &&
        day === today.getDate()
    );
}

function updateStats() {

    totalHabitsElement.textContent =
        habits.length;

    let completed = 0;

    habits.forEach(function(habit) {

        completed +=
            habit.completedDates.length;
    });

    completedCountElement.textContent =
        completed;

    if (habits.length === 0) {

        completionRateElement.textContent =
            "0%";

        return;
    }

    const today = new Date();

    const year = today.getFullYear();

    const month = today.getMonth();

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();

    const possible =
        habits.length * daysInMonth;

    const rate =
        Math.round(
            (completed / possible) * 100
        );

    completionRateElement.textContent =
        `${rate}%`;
}

function saveHabits() {

    localStorage.setItem(
        "habits",
        JSON.stringify(habits)
    );
}