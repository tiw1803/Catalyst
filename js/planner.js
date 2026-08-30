document.addEventListener("DOMContentLoaded", () => {
    const examModal = document.getElementById("planner-exam-modal");
    const examModalBackdrop = document.getElementById("planner-exam-modal-backdrop");
    const examModalClose = document.getElementById("planner-exam-modal-close");
    const examModalCancel = document.getElementById("planner-exam-modal-cancel");
    const examForm = document.getElementById("planner-exam-form");

    const addExamButton = document.getElementById("planner-add-exam");
    const examList = document.getElementById("planner-exams-list");
    const examEmptyState = document.getElementById("planner-exams-empty");

    const examTitleInput = document.getElementById("planner-exam-title");
    const examSubjectInput = document.getElementById("planner-exam-subject");
    const examDateInput = document.getElementById("planner-exam-date");
    const taskList = document.getElementById("planner-task-list");
    const emptyState = document.getElementById("planner-empty-state");
    const addTaskButton = document.getElementById("planner-add-task");
    const emptyAddButton = document.getElementById("planner-empty-add");

    const modal = document.getElementById("planner-modal");
    const modalBackdrop = document.getElementById("planner-modal-backdrop");
    const modalClose = document.getElementById("planner-modal-close");
    const modalCancel = document.getElementById("planner-modal-cancel");
    const taskForm = document.getElementById("planner-task-form");

    const titleInput = document.getElementById("planner-task-title");
    const subjectInput = document.getElementById("planner-task-subject");
    const priorityInput = document.getElementById("planner-task-priority");
    const durationInput = document.getElementById("planner-task-duration");
    const dateInput = document.getElementById("planner-task-date");

    const totalTasks = document.getElementById("planner-total-tasks");
    const completedTasks = document.getElementById("planner-completed-tasks");
    const remainingTasks = document.getElementById("planner-remaining-tasks");
    const progress = document.getElementById("planner-progress");
    const progressPercent = document.getElementById("planner-progress-percent");
    const progressBar = document.getElementById("planner-progress-bar");
    const progressMessage = document.getElementById("planner-progress-message");
    const taskCount = document.getElementById("planner-task-count");

    const filters = document.querySelectorAll(".planner-filter");
    const subjectFilter = document.getElementById("planner-subject-filter");

    const calendarTitle = document.getElementById("planner-calendar-title");
    const calendarGrid = document.getElementById("planner-calendar-grid");
    const previousMonthButton = document.getElementById("planner-prev-month");
    const nextMonthButton = document.getElementById("planner-next-month");
    const todayButton = document.getElementById("planner-today");

    const plannerDate = document.getElementById("planner-date");

    if (!taskList || !taskForm || !modal || !calendarGrid) {
        return;
    }

    let selectedDate = new Date();
    let calendarDate = new Date();
    let activeFilter = "all";
    let activeSubject = "all";

    selectedDate.setHours(0, 0, 0, 0);
    calendarDate.setDate(1);
    calendarDate.setHours(0, 0, 0, 0);

    const formatDateKey = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const todayKey = formatDateKey(new Date());

    const getTasks = () => {
        if (typeof CatalystData?.getTasks !== "function") {
            return [];
        }

        return CatalystData.getTasks() || [];
    };

    const getDateTasks = (date) => {
        const dateKey = formatDateKey(date);

        return getTasks().filter((task) => task.date === dateKey);
    };

    const getTaskCompletedState = (task) => {
        return task.completed === true || task.completed === "true";
    };

    const updateHeaderDate = () => {
        if (!plannerDate) {
            return;
        }

        plannerDate.textContent = selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric"
        });
    };

    const updateStats = () => {
        const tasks = getDateTasks(selectedDate);

        const completed = tasks.filter(getTaskCompletedState).length;
        const remaining = tasks.length - completed;
        const percentage = tasks.length
            ? Math.round((completed / tasks.length) * 100)
            : 0;

        if (totalTasks) {
            totalTasks.textContent = tasks.length;
        }

        if (completedTasks) {
            completedTasks.textContent = completed;
        }

        if (remainingTasks) {
            remainingTasks.textContent = remaining;
        }

        if (progress) {
            progress.textContent = `${percentage}%`;
        }

        if (progressPercent) {
            progressPercent.textContent = `${percentage}%`;
        }

        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }

        if (progressMessage) {
            if (!tasks.length) {
                progressMessage.textContent = "Start with your first task.";
            } else if (percentage === 100) {
                progressMessage.textContent = "Perfect. You completed everything.";
            } else if (percentage >= 75) {
                progressMessage.textContent = "Almost there. Finish strong.";
            } else if (percentage >= 50) {
                progressMessage.textContent = "Great progress. Keep going.";
            } else {
                progressMessage.textContent = "Keep moving. Every task counts.";
            }
        }

        if (taskCount) {
            taskCount.textContent = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
        }
    };

    const updateSubjectFilter = () => {
        if (!subjectFilter) {
            return;
        }

        const currentValue = subjectFilter.value;
        const subjects = [
            ...new Set(
                getDateTasks(selectedDate)
                    .map((task) => task.subject)
                    .filter(Boolean)
            )
        ].sort((a, b) => a.localeCompare(b));

        subjectFilter.innerHTML = "";

        const allOption = document.createElement("option");
        allOption.value = "all";
        allOption.textContent = "All subjects";
        subjectFilter.appendChild(allOption);

        subjects.forEach((subject) => {
            const option = document.createElement("option");
            option.value = subject;
            option.textContent = subject;
            subjectFilter.appendChild(option);
        });

        if (subjects.includes(currentValue)) {
            subjectFilter.value = currentValue;
        } else {
            subjectFilter.value = "all";
            activeSubject = "all";
        }
    };

    const renderTasks = () => {
        const tasks = getDateTasks(selectedDate);

        const filteredTasks = tasks.filter((task) => {
            const completed = getTaskCompletedState(task);

            const matchesStatus =
                activeFilter === "all" ||
                (activeFilter === "completed" && completed) ||
                (activeFilter === "pending" && !completed);

            const matchesSubject =
                activeSubject === "all" ||
                task.subject === activeSubject;

            return matchesStatus && matchesSubject;
        });

        taskList.innerHTML = "";

        if (!filteredTasks.length) {
            emptyState.hidden = false;

            if (tasks.length) {
                const heading = emptyState.querySelector("h3");
                const message = emptyState.querySelector("p");

                if (heading) {
                    heading.textContent = "No matching tasks";
                }

                if (message) {
                    message.textContent = "Try changing your filters.";
                }
            } else {
                const heading = emptyState.querySelector("h3");
                const message = emptyState.querySelector("p");

                if (heading) {
                    heading.textContent = "No tasks for this day";
                }

                if (message) {
                    message.textContent = "Add a task to start planning your day.";
                }
            }

            return;
        }

        emptyState.hidden = true;

        filteredTasks.forEach((task) => {
            const completed = getTaskCompletedState(task);

            const taskElement = document.createElement("article");
            taskElement.className = `planner-task${completed ? " completed" : ""}`;
            taskElement.dataset.taskId = task.id;

            const checkButton = document.createElement("button");
            checkButton.type = "button";
            checkButton.className = "planner-task-check";
            checkButton.setAttribute(
                "aria-label",
                completed ? "Mark task as incomplete" : "Mark task as complete"
            );

            checkButton.innerHTML = `
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m5 12 4 4L19 6"></path>
                </svg>
            `;

            checkButton.addEventListener("click", () => {
                toggleTask(task);
            });

            const content = document.createElement("div");
            content.className = "planner-task-content";

            const title = document.createElement("h4");
            title.className = "planner-task-title";
            title.textContent = task.title || "Untitled task";

            const meta = document.createElement("div");
            meta.className = "planner-task-meta";

            if (task.subject) {
                const subject = document.createElement("span");
                subject.className = "planner-task-subject";
                subject.textContent = task.subject;
                meta.appendChild(subject);
            }

            if (task.duration) {
                const duration = document.createElement("span");
                duration.textContent = `${task.duration} min`;
                meta.appendChild(duration);
            }

            if (task.priority) {
                const priority = document.createElement("span");
                priority.className = "planner-task-priority";
                priority.dataset.priority = task.priority;
                priority.textContent =
                    task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
                meta.appendChild(priority);
            }

            content.appendChild(title);
            content.appendChild(meta);

            const actions = document.createElement("div");
            actions.className = "planner-task-actions";

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "planner-task-delete";
            deleteButton.setAttribute("aria-label", `Delete ${task.title || "task"}`);

            deleteButton.innerHTML = `
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"></path>
                </svg>
            `;

            deleteButton.addEventListener("click", () => {
                deleteTask(task);
            });

            actions.appendChild(deleteButton);

            taskElement.appendChild(checkButton);
            taskElement.appendChild(content);
            taskElement.appendChild(actions);

            taskList.appendChild(taskElement);
        });
    };

    const refreshPlanner = () => {
        updateHeaderDate();
        updateStats();
        updateSubjectFilter();
        renderTasks();
        renderCalendar();
        renderExams();
    };

    const toggleTask = (task) => {
        if (getTaskCompletedState(task)) {
            if (typeof CatalystData?.uncompleteTask === "function") {
                CatalystData.uncompleteTask(task.id);
            }
        } else {
            if (typeof CatalystData?.completeTask === "function") {
                CatalystData.completeTask(task.id);
            }
        }

        refreshPlanner();
    };

    const deleteTask = (task) => {
        if (typeof CatalystData?.deleteTask !== "function") {
            return;
        }

        CatalystData.deleteTask(task.id);
        refreshPlanner();
    };

    const openModal = () => {
        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");

        dateInput.value = formatDateKey(selectedDate);

        requestAnimationFrame(() => {
            titleInput.focus();
        });
    };

    const closeModal = () => {
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        taskForm.reset();
        dateInput.value = formatDateKey(selectedDate);
    };

    const addTask = (event) => {
        event.preventDefault();

        if (typeof CatalystData?.addTask !== "function") {
            return;
        }

        const title = titleInput.value.trim();

        if (!title) {
            titleInput.focus();
            return;
        }

        const taskDate = dateInput.value || formatDateKey(selectedDate);

        CatalystData.addTask({
            title,
            subject: subjectInput.value.trim(),
            duration: Number(durationInput.value) || 0,
            priority: priorityInput.value,
            date: taskDate
        });

        const createdDate = new Date(`${taskDate}T00:00:00`);

        if (!Number.isNaN(createdDate.getTime())) {
            selectedDate = createdDate;
            calendarDate = new Date(createdDate);
            calendarDate.setDate(1);
        }

        closeModal();
        refreshPlanner();
    };

    const renderCalendar = () => {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();

        if (calendarTitle) {
            calendarTitle.textContent = calendarDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric"
            });
        }

        calendarGrid.innerHTML = "";

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const startOffset = (firstDay.getDay() + 6) % 7;
        const daysInMonth = lastDay.getDate();

        const previousMonthLastDay = new Date(year, month, 0).getDate();

        for (let index = startOffset - 1; index >= 0; index--) {
            const day = previousMonthLastDay - index;
            const date = new Date(year, month - 1, day);
            createCalendarDay(date, true);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            createCalendarDay(date, false);
        }

        const totalCells = calendarGrid.children.length;
        const remainingCells = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;

        for (let day = 1; day <= remainingCells; day++) {
            const date = new Date(year, month + 1, day);
            createCalendarDay(date, true);
        }
    };

    const createCalendarDay = (date, otherMonth) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "planner-calendar-day";

        const dateKey = formatDateKey(date);
        const selectedKey = formatDateKey(selectedDate);

        button.textContent = date.getDate();
        button.dataset.date = dateKey;
        button.setAttribute(
            "aria-label",
            date.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            })
        );

        if (otherMonth) {
            button.classList.add("other-month");
        }

        if (dateKey === todayKey) {
            button.classList.add("today");
        }

        if (dateKey === selectedKey) {
            button.classList.add("selected");
        }

        if (getDateTasks(date).length) {
            button.classList.add("has-tasks");
        }

        button.addEventListener("click", () => {
            selectedDate = new Date(date);
            selectedDate.setHours(0, 0, 0, 0);

            calendarDate = new Date(date);
            calendarDate.setDate(1);
            calendarDate.setHours(0, 0, 0, 0);

            activeFilter = "all";
            activeSubject = "all";

            filters.forEach((filter) => {
                filter.classList.toggle(
                    "active",
                    filter.dataset.filter === "all"
                );
                filter.setAttribute(
                    "aria-selected",
                    filter.dataset.filter === "all" ? "true" : "false"
                );
            });

            refreshPlanner();
        });

        calendarGrid.appendChild(button);
    };

    filters.forEach((filter) => {
        filter.addEventListener("click", () => {
            activeFilter = filter.dataset.filter;

            filters.forEach((item) => {
                const active = item === filter;

                item.classList.toggle("active", active);
                item.setAttribute(
                    "aria-selected",
                    active ? "true" : "false"
                );
            });

            renderTasks();
        });
    });

    if (subjectFilter) {
        subjectFilter.addEventListener("change", () => {
            activeSubject = subjectFilter.value;
            renderTasks();
        });
    }

    if (addTaskButton) {
        addTaskButton.addEventListener("click", openModal);
    }

    if (emptyAddButton) {
        emptyAddButton.addEventListener("click", openModal);
    }

    modalClose.addEventListener("click", closeModal);
    modalCancel.addEventListener("click", closeModal);
    modalBackdrop.addEventListener("click", closeModal);

    taskForm.addEventListener("submit", addTask);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("open")) {
            closeModal();
        }
    });

    if (previousMonthButton) {
        previousMonthButton.addEventListener("click", () => {
            calendarDate.setMonth(calendarDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextMonthButton) {
        nextMonthButton.addEventListener("click", () => {
            calendarDate.setMonth(calendarDate.getMonth() + 1);
            renderCalendar();
        });
    }

    if (todayButton) {
        todayButton.addEventListener("click", () => {
            const today = new Date();

            selectedDate = new Date(today);
            selectedDate.setHours(0, 0, 0, 0);

            calendarDate = new Date(today);
            calendarDate.setDate(1);
            calendarDate.setHours(0, 0, 0, 0);

            activeFilter = "all";
            activeSubject = "all";

            filters.forEach((filter) => {
                const active = filter.dataset.filter === "all";

                filter.classList.toggle("active", active);
                filter.setAttribute(
                    "aria-selected",
                    active ? "true" : "false"
                );
            });

            refreshPlanner();
        });
    }

    if (dateInput) {
        dateInput.value = formatDateKey(selectedDate);
    }

    refreshPlanner();
});
function renderExams() {
    const exams = CatalystData.getExams()
        .filter(exam => {
            const examDate = new Date(`${exam.date}T00:00:00`);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            return examDate >= today;
        })
        .sort((a, b) => a.date.localeCompare(b.date));

    examList.querySelectorAll(".planner-exam-card").forEach(card => {
        card.remove();
    });

    if (!exams.length) {
        examEmptyState.hidden = false;
        return;
    }

    examEmptyState.hidden = true;

    exams.forEach(exam => {
        const examDate = new Date(`${exam.date}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const daysRemaining = Math.ceil(
            (examDate - today) / (1000 * 60 * 60 * 24)
        );

        const card = document.createElement("article");
        card.className = "planner-exam-card";

        card.innerHTML = `
            <div class="planner-exam-card-content">
                <span class="section-eyebrow">${exam.subject}</span>
                <h3>${exam.topic}</h3>
                <p>${formatExamDate(exam.date)}</p>
            </div>

            <div class="planner-exam-card-meta">
                <span>
                    ${daysRemaining === 0
                        ? "Today"
                        : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`}
                </span>

                <button
                    type="button"
                    class="btn btn-icon planner-delete-exam"
                    data-exam-id="${exam.id}"
                    aria-label="Delete ${exam.topic}">
                    ×
                </button>
            </div>
        `;

        examList.appendChild(card);
    });
}
function formatExamDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}
function openExamModal() {
    examModal.hidden = false;
    examModal.setAttribute("aria-hidden", "false");

    examForm.reset();

    requestAnimationFrame(() => {
        examModal.classList.add("is-open");
    });

    examTitleInput.focus();
}

function closeExamModal() {
    examModal.classList.remove("is-open");

    examModal.setAttribute("aria-hidden", "true");

    setTimeout(() => {
        examModal.hidden = true;
    }, 200);
}
addExamButton.addEventListener("click", openExamModal);
examModalClose.addEventListener("click", closeExamModal);
examModalCancel.addEventListener("click", closeExamModal);
examModalBackdrop.addEventListener("click", closeExamModal);
examForm.addEventListener("submit", event => {
    event.preventDefault();

    CatalystData.addExam({
        topic: examTitleInput.value.trim(),
        subject: examSubjectInput.value.trim(),
        date: examDateInput.value
    });

    closeExamModal();
    renderExams();
});
examList.addEventListener("click", event => {
    const deleteButton = event.target.closest(".planner-delete-exam");

    if (!deleteButton) {
        return;
    }

    const examId = Number(deleteButton.dataset.examId);

    CatalystData.deleteExam(examId);
    renderExams();
});