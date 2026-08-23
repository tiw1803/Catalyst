const CatalystData = {
    storageKey: "catalystData",
    version: 2,
    xpPerLevel: 500,
    xpPerCompletedTask: 25,
    listeners: new Set(),

    getTodayDate() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    },

    createDefaultData() {
        const today = this.getTodayDate();

        return {
            version: this.version,
            user: {
                name: "Student"
            },
            xp: 2480,
            tasks: [
                {
                    id: 1,
                    title: "Complete mathematics revision",
                    subject: "Mathematics",
                    duration: 45,
                    priority: "high",
                    completed: true,
                    date: today
                },
                {
                    id: 2,
                    title: "Read physics chapter 4",
                    subject: "Physics",
                    duration: 30,
                    priority: "medium",
                    completed: true,
                    date: today
                },
                {
                    id: 3,
                    title: "Finish Catalyst UI work",
                    subject: "Personal",
                    duration: 60,
                    priority: "high",
                    completed: false,
                    date: today
                },
                {
                    id: 4,
                    title: "Review chemistry notes",
                    subject: "Chemistry",
                    duration: 25,
                    priority: "low",
                    completed: false,
                    date: today
                }
            ],
            xpEvents: [
                {
                    id: "seed-daily-xp",
                    amount: 50,
                    date: today,
                    sourceType: "task",
                    sourceId: "seed"
                }
            ],
            focusSessions: [
                { id: "seed-focus-one", minutes: 60, date: today },
                { id: "seed-focus-two", minutes: 48, date: today },
                { id: "seed-focus-three", minutes: 51, date: today },
                { id: "seed-focus-four", minutes: 45, date: today }
            ],
            streak: {
                current: 12,
                best: 18,
                lastActiveDate: today
            },
            exams: [
                {
                    id: 1,
                    subject: "Mathematics",
                    topic: "Algebra & Trigonometry",
                    date: "2026-08-24"
                },
                {
                    id: 2,
                    subject: "Physics",
                    topic: "Mechanics & Motion",
                    date: "2026-08-29"
                },
                {
                    id: 3,
                    subject: "Chemistry",
                    topic: "Atoms & Chemical Bonding",
                    date: "2026-09-03"
                }
            ]
        };
    },

    clone(value) {
        return JSON.parse(JSON.stringify(value));
    },

    readStoredData() {
        const storedData = localStorage.getItem(this.storageKey);

        if (!storedData) {
            return null;
        }

        try {
            return JSON.parse(storedData);
        } catch {
            localStorage.removeItem(this.storageKey);
            return null;
        }
    },

    write(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    },

    isLegacyDemoTasks(tasks) {
        const titles = [
            "Complete mathematics revision",
            "Read physics chapter 4",
            "Finish Catalyst UI work",
            "Review chemistry notes"
        ];

        return tasks.length === titles.length && tasks.every((task, index) =>
            task.id === index + 1 && task.title === titles[index]
        );
    },

    normalize(data) {
        const fallback = this.createDefaultData();
        const today = this.getTodayDate();
        const tasks = Array.isArray(data?.tasks)
            ? data.tasks.map(task => ({ ...task }))
            : fallback.tasks;

        if (
            this.isLegacyDemoTasks(tasks) &&
            !tasks.some(task => task.date === today)
        ) {
            tasks.forEach(task => {
                task.date = today;
            });
        }

        const legacyFocus = data?.focus || {};
        const focusSessions = Array.isArray(data?.focusSessions)
            ? data.focusSessions.map(session => ({ ...session }))
            : this.createLegacyFocusSessions(legacyFocus, today);

        const xpEvents = Array.isArray(data?.xpEvents)
            ? data.xpEvents.map(event => ({ ...event }))
            : this.createLegacyXPEvents(tasks, today);

        return {
            version: this.version,
            user: {
                ...fallback.user,
                ...(data?.user || {})
            },
            xp: Math.max(0, Number(data?.xp) || 0),
            tasks,
            xpEvents,
            focusSessions,
            streak: {
                ...fallback.streak,
                ...(data?.streak || {})
            },
            exams: Array.isArray(data?.exams)
                ? data.exams.map(exam => ({ ...exam }))
                : fallback.exams
        };
    },

    createLegacyFocusSessions(focus, today) {
        const totalMinutes = Math.max(0, Number(focus.totalMinutes) || 0);
        const todayMinutes = Math.min(
            totalMinutes,
            Math.max(0, Number(focus.todayMinutes) || 0)
        );
        const sessions = [];

        if (totalMinutes > todayMinutes) {
            sessions.push({
                id: "legacy-focus-history",
                minutes: totalMinutes - todayMinutes,
                date: "1970-01-01"
            });
        }

        if (todayMinutes > 0) {
            sessions.push({
                id: "legacy-focus-today",
                minutes: todayMinutes,
                date: today
            });
        }

        return sessions;
    },

    createLegacyXPEvents(tasks, today) {
        const dailyCompletedTasks = tasks.filter(task =>
            task.date === today && task.completed
        ).length;

        if (!dailyCompletedTasks) {
            return [];
        }

        return [{
            id: "legacy-daily-xp",
            amount: dailyCompletedTasks * this.xpPerCompletedTask,
            date: today,
            sourceType: "task",
            sourceId: "legacy"
        }];
    },

    init() {
        const storedData = this.readStoredData();
        const normalizedData = this.normalize(
            storedData || this.createDefaultData()
        );

        if (
            !storedData ||
            JSON.stringify(storedData) !== JSON.stringify(normalizedData)
        ) {
            this.write(normalizedData);
        }

        return this.clone(normalizedData);
    },

    get() {
        return this.init();
    },

    save(data) {
        const normalizedData = this.normalize(data);

        this.write(normalizedData);
        this.notify(normalizedData);

        return this.clone(normalizedData);
    },

    update(mutator) {
        const data = this.get();

        mutator(data);

        return this.save(data);
    },

    reset() {
        const data = this.createDefaultData();

        this.write(data);
        this.notify(data);

        return this.clone(data);
    },

    subscribe(listener) {
        this.listeners.add(listener);

        return () => this.listeners.delete(listener);
    },

    notify(data) {
        const stats = this.getStatsFromData(data);

        this.listeners.forEach(listener => listener(stats));

        window.dispatchEvent(
            new CustomEvent("catalyst:datachange", {
                detail: stats
            })
        );
    },

    getTasks(date = this.getTodayDate()) {
        return this.get().tasks.filter(task => task.date === date);
    },

    getCompletedTasks(date = this.getTodayDate()) {
        return this.getTasks(date).filter(task => task.completed);
    },

    getRemainingTasks(date = this.getTodayDate()) {
        return this.getTasks(date).filter(task => !task.completed);
    },

    getDailyProgress(date = this.getTodayDate()) {
        const tasks = this.getTasks(date);

        if (!tasks.length) {
            return 0;
        }

        return Math.round(
            (tasks.filter(task => task.completed).length / tasks.length) * 100
        );
    },

    getLevelFromXP(xp) {
        return Math.floor(xp / this.xpPerLevel) + 1;
    },

    getStatsFromData(data) {
        const today = this.getTodayDate();
        const todayTasks = data.tasks.filter(task => task.date === today);
        const completedTasks = todayTasks.filter(task => task.completed).length;
        const totalTasks = todayTasks.length;
        const dailyProgress = totalTasks
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0;
        const totalFocusMinutes = data.focusSessions.reduce(
            (total, session) => total + Math.max(0, Number(session.minutes) || 0),
            0
        );
        const todayFocusSessions = data.focusSessions.filter(
            session => session.date === today
        );
        const todayFocusMinutes = todayFocusSessions.reduce(
            (total, session) => total + Math.max(0, Number(session.minutes) || 0),
            0
        );
        const dailyXPEarned = data.xpEvents
            .filter(event => event.date === today)
            .reduce(
                (total, event) => total + Math.max(0, Number(event.amount) || 0),
                0
            );
        const level = this.getLevelFromXP(data.xp);
        const currentLevelStartXP = (level - 1) * this.xpPerLevel;
        const nextLevelXP = level * this.xpPerLevel;

        return {
            currentXP: data.xp,
            xp: data.xp,
            level,
            currentLevelXP: data.xp - currentLevelStartXP,
            xpRequiredForNextLevel: nextLevelXP,
            xpRequiredForLevel: this.xpPerLevel,
            xpUntilNextLevel: Math.max(0, nextLevelXP - data.xp),
            dailyXPEarned,
            currentStreak: data.streak.current,
            longestStreak: data.streak.best,
            streak: data.streak.current,
            bestStreak: data.streak.best,
            totalFocusMinutes,
            todayFocusMinutes,
            focusMinutes: todayFocusMinutes,
            todayFocusSessions: todayFocusSessions.length,
            totalGoalsToday: totalTasks,
            goalsCompletedToday: completedTasks,
            totalTasks,
            completedTasks,
            remainingTasks: totalTasks - completedTasks,
            dailyProgress,
            progressRingPercentage: dailyProgress
        };
    },

    getStats() {
        return this.getStatsFromData(this.get());
    },

    recordXPGain(data, amount, sourceType, sourceId) {
        const earnedXP = Math.max(0, Number(amount) || 0);

        if (!earnedXP) {
            return;
        }

        data.xp += earnedXP;
        data.xpEvents.push({
            id: `${sourceType}-${sourceId}-${Date.now()}`,
            amount: earnedXP,
            date: this.getTodayDate(),
            sourceType,
            sourceId: String(sourceId)
        });
    },

    setXP(amount) {
        return this.update(data => {
            data.xp = Math.max(0, Number(amount) || 0);
        });
    },

    awardXP(amount, sourceType = "manual", sourceId = Date.now()) {
        return this.update(data => {
            this.recordXPGain(data, amount, sourceType, sourceId);
            this.applyActivityToStreak(data);
        });
    },

    completeTask(taskId) {
        return this.update(data => {
            const task = data.tasks.find(task => task.id === taskId);

            if (!task || task.completed) {
                return;
            }

            task.completed = true;
            this.recordXPGain(
                data,
                this.xpPerCompletedTask,
                "task",
                task.id
            );
            this.applyActivityToStreak(data);
        });
    },

    uncompleteTask(taskId) {
        return this.update(data => {
            const task = data.tasks.find(task => task.id === taskId);

            if (!task || !task.completed) {
                return;
            }

            task.completed = false;

            const eventIndex = data.xpEvents.findIndex(event =>
                event.sourceType === "task" &&
                event.sourceId === String(task.id)
            );

            if (eventIndex !== -1) {
                const [event] = data.xpEvents.splice(eventIndex, 1);
                data.xp = Math.max(0, data.xp - event.amount);
            }
        });
    },

    addTask(task) {
        let newTask;

        this.update(data => {
            newTask = {
                id: Date.now(),
                title: task.title || "New task",
                subject: task.subject || "General",
                duration: Math.max(0, Number(task.duration) || 0),
                priority: task.priority || "medium",
                completed: false,
                date: task.date || this.getTodayDate()
            };

            data.tasks.push(newTask);
        });

        return newTask;
    },

    deleteTask(taskId) {
        return this.update(data => {
            data.tasks = data.tasks.filter(task => task.id !== taskId);
            data.xpEvents = data.xpEvents.filter(event =>
                !(
                    event.sourceType === "task" &&
                    event.sourceId === String(taskId)
                )
            );
        });
    },

    addFocusSession(minutes) {
        const sessionMinutes = Math.max(0, Number(minutes) || 0);

        if (!sessionMinutes) {
            return this.get();
        }

        return this.update(data => {
            const sessionId = Date.now();

            data.focusSessions.push({
                id: sessionId,
                minutes: sessionMinutes,
                date: this.getTodayDate()
            });

            this.recordXPGain(
                data,
                Math.floor(sessionMinutes / 5) * 2,
                "focus",
                sessionId
            );
            this.applyActivityToStreak(data);
        });
    },

    resetTodayFocus() {
        const today = this.getTodayDate();

        return this.update(data => {
            data.focusSessions = data.focusSessions.filter(
                session => session.date !== today
            );
        });
    },

    applyActivityToStreak(data) {
        const today = this.getTodayDate();
        const lastActiveDate = data.streak.lastActiveDate;

        if (lastActiveDate === today) {
            return;
        }

        if (!lastActiveDate) {
            data.streak.current = 1;
        } else {
            const lastActive = new Date(`${lastActiveDate}T00:00:00`);
            const currentDate = new Date(`${today}T00:00:00`);
            const difference = Math.round(
                (currentDate - lastActive) / (1000 * 60 * 60 * 24)
            );

            if (difference === 1) {
                data.streak.current += 1;
            } else if (difference > 1) {
                data.streak.current = 1;
            }
        }

        data.streak.best = Math.max(data.streak.best, data.streak.current);
        data.streak.lastActiveDate = today;
    },

    updateStreak() {
        return this.update(data => {
            this.applyActivityToStreak(data);
        });
    }
};

window.addEventListener("storage", event => {
    if (event.key === CatalystData.storageKey) {
        const data = CatalystData.readStoredData();

        if (data) {
            CatalystData.notify(CatalystData.normalize(data));
        }
    }
});

CatalystData.init();
