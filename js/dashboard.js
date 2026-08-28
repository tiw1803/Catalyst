const sidebar = document.getElementById("dashboard-sidebar");
const menuToggle = document.getElementById("dashboard-menu-toggle");
const dashboardDate = document.getElementById("dashboard-date");

const CatalystDashboard = {
    init() {
        this.setupSidebar();
        this.updateDate();
        this.setupTaskEvents();
        this.setupDataSubscription();
        this.render(CatalystData.getStats());
    },

    setupDataSubscription() {
        CatalystData.subscribe(stats => {
            this.render(stats);
        });
    },

    render(stats) {
        this.renderStats(stats);
        this.renderTasks();
        this.renderProgress(stats);
        this.renderXP(stats);
        this.renderStreak(stats);
    },

    setupSidebar() {
        if (!sidebar || !menuToggle) {
            return;
        }

        menuToggle.addEventListener("click", () => {
            const collapsed = sidebar.classList.toggle("collapsed");

            menuToggle.setAttribute(
                "aria-expanded",
                String(!collapsed)
            );

            menuToggle.setAttribute(
                "aria-label",
                collapsed ? "Expand navigation" : "Collapse navigation"
            );
        });
    },

    updateDate() {
        if (!dashboardDate) {
            return;
        }

        const today = new Date();

        dashboardDate.textContent = today.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );
    },

    renderStats(stats) {
        const xpValue = document.querySelector("[data-dashboard-current-xp]");
        const dailyXP = document.querySelector("[data-dashboard-daily-xp]");
        const streakValue = document.querySelector(
            "[data-dashboard-current-streak]"
        );
        const longestStreak = document.querySelector(
            "[data-dashboard-longest-streak]"
        );
        const todayFocus = document.querySelector(
            "[data-dashboard-today-focus]"
        );
        const totalFocus = document.querySelector(
            "[data-dashboard-total-focus]"
        );
        const goals = document.querySelector("[data-dashboard-goals]");
        const progressSummary = document.querySelector(
            "[data-dashboard-progress-summary]"
        );
        const navigationLevel = document.querySelector(
            "[data-dashboard-nav-level]"
        );

        if (xpValue) {
            xpValue.textContent = stats.xp.toLocaleString();
        }

        if (dailyXP) {
            dailyXP.textContent = `+${stats.dailyXPEarned} XP today`;
        }

        if (streakValue) {
            streakValue.textContent = `${stats.streak} days`;
        }

        if (longestStreak) {
            longestStreak.textContent = `Personal best: ${stats.longestStreak}`;
        }

        if (todayFocus) {
            todayFocus.textContent = this.formatMinutes(stats.todayFocusMinutes);
        }

        if (totalFocus) {
            totalFocus.textContent = `${this.formatMinutes(stats.totalFocusMinutes)} total`;
        }

        if (goals) {
            goals.textContent = `${stats.goalsCompletedToday} / ${stats.totalGoalsToday}`;
        }

        if (progressSummary) {
            progressSummary.textContent = `${stats.dailyProgress}% completed`;
        }

        if (navigationLevel) {
            navigationLevel.textContent = `Level ${stats.level}`;
        }
    },

    renderTasks() {
        const tasks = CatalystData.getTasks();
        const taskList = document.querySelector(".task-list");

        if (!taskList) {
            return;
        }

        if (!tasks.length) {
            taskList.innerHTML = `
                <div class="task-empty-state">
                    <strong>No tasks for today</strong>
                    <span>Add a task from the planner to get started.</span>
                </div>
            `;

            return;
        }

        taskList.innerHTML = tasks.map(task => `
            <label class="task-item ${task.completed ? "completed" : ""}" data-task-id="${task.id}">

                <input
                    type="checkbox"
                    ${task.completed ? "checked" : ""}
                    data-task-checkbox
                >

                <span class="task-checkbox">
                    ${task.completed ? `
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="m5 12 4 4L19 6"></path>
                        </svg>
                    ` : ""}
                </span>

                <span class="task-content">
                    <strong>${this.escapeHTML(task.title)}</strong>
                    <small>${this.escapeHTML(task.subject)} · ${task.duration} min</small>
                </span>

                <span class="task-priority ${task.priority}">
                    ${this.capitalize(task.priority)}
                </span>

            </label>
        `).join("");
    },

    setupTaskEvents() {
        const taskList = document.querySelector(".task-list");

        if (!taskList) {
            return;
        }

        taskList.addEventListener("change", event => {
            const checkbox = event.target.closest("[data-task-checkbox]");

            if (!checkbox) {
                return;
            }

            const taskItem = checkbox.closest("[data-task-id]");

            if (!taskItem) {
                return;
            }

            const taskId = Number(taskItem.dataset.taskId);

            if (checkbox.checked) {
                CatalystData.completeTask(taskId);
            } else {
                CatalystData.uncompleteTask(taskId);
            }

        });
    },

    renderProgress(stats) {
        const dailyProgress = Math.min(
            Math.max(Number(stats.progressRingPercentage) || 0, 0),
            100
        );

        const percent = document.querySelector(
            "[data-dashboard-progress-percent]"
        );

        const circle = document.querySelector(
            ".progress-circle-value"
        );

        const circleValue = document.querySelector(
            "[data-dashboard-progress-value]"
        );

        const progressCircle = document.querySelector(
            "[data-dashboard-progress-ring]"
        );

        const completedText = document.querySelector(
            "[data-dashboard-goals-completed]"
        );

        const remainingText = document.querySelector(
            "[data-dashboard-goals-remaining]"
        );

        const focusText = document.querySelector(
            "[data-dashboard-focus-detail]"
        );

        const focusSessions = document.querySelector(
            "[data-dashboard-focus-sessions]"
        );

        if (percent) {
            percent.textContent = `${dailyProgress}%`;
        }

        if (circleValue) {
            circleValue.textContent = `${dailyProgress}%`;
        }

        if (circle) {
            circle.style.strokeDashoffset =
                100 - dailyProgress;
        }

        if (progressCircle) {
            progressCircle.setAttribute(
                "aria-label",
                `${dailyProgress} percent complete`
            );
        }

        if (completedText) {
            completedText.textContent =
                `${stats.completedTasks} completed`;
        }

        if (remainingText) {
            remainingText.textContent =
                `${stats.remainingTasks} remaining`;
        }

        if (focusText) {
            focusText.textContent =
                `${this.formatMinutes(stats.todayFocusMinutes)} focused`;
        }

        if (focusSessions) {
            focusSessions.textContent =
                `Across ${stats.todayFocusSessions} sessions`;
        }
    },

    renderXP(stats) {
        const levelTitle = document.querySelector(
            "[data-dashboard-level-title]"
        );

        const currentXP = document.querySelector(
            "[data-dashboard-level-current-xp]"
        );

        const nextLevelXP = document.querySelector(
            "[data-dashboard-next-level-xp]"
        );

        const xpBar = document.querySelector(
            ".xp-progress-value"
        );

        const xpDescription = document.querySelector(
            "[data-dashboard-xp-to-next]"
        );

        const levelProgress =
            (stats.currentLevelXP / stats.xpRequiredForLevel) * 100;

        if (levelTitle) {
            levelTitle.textContent = `Level ${stats.level}`;
        }

        if (currentXP) {
            currentXP.textContent = `${stats.currentXP.toLocaleString()} XP`;
        }

        if (nextLevelXP) {
            nextLevelXP.textContent =
                `${stats.xpRequiredForNextLevel.toLocaleString()} XP`;
        }

        if (xpBar) {
            xpBar.style.width = `${Math.min(levelProgress, 100)}%`;
        }

        if (xpDescription) {
            xpDescription.textContent =
                `${stats.xpUntilNextLevel} XP until Level ${stats.level + 1}`;
        }
    },

    renderStreak(stats) {
        const streakNumber = document.querySelector(
            "[data-dashboard-streak-value]"
        );

        if (streakNumber) {
            streakNumber.textContent = stats.streak;
        }

        const streakDays = document.querySelectorAll(
            ".streak-day"
        );

        const today = new Date().getDay();
        const mondayIndex = today === 0 ? 6 : today - 1;

        streakDays.forEach((day, index) => {
            day.classList.toggle(
                "today",
                index === mondayIndex
            );
        });
    },

    formatMinutes(minutes) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (hours === 0) {
            return `${remainingMinutes}m`;
        }

        if (remainingMinutes === 0) {
            return `${hours}h`;
        }

        return `${hours}h ${remainingMinutes}m`;
    },

    capitalize(value) {
        if (!value) {
            return "";
        }

        return value.charAt(0).toUpperCase() + value.slice(1);
    },

    escapeHTML(value) {
        const div = document.createElement("div");
        div.textContent = value;
        return div.innerHTML;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    CatalystDashboard.init();
});
