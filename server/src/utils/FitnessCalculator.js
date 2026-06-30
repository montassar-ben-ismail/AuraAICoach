export class FitnessCalculator {
    static calculateBMR(gender, weight, height, age) {
        if (gender === "male") {
            return (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
            return (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }
    }

    static calculateTDEE(bmr, activityFactor) {
        return bmr * activityFactor;
    }

    static calculateDailyTargets(user) {
        const { gender, weight, height, age, AF, target } = user;
        const bmr = this.calculateBMR(gender, weight, height, age);
        const tdee = this.calculateTDEE(bmr, AF);

        let dailyCalorie = tdee;
        let proteinPerKg = 1.5;
        let fatPerKg = 0.8;

        switch (target) {
            case "lose weight":
                dailyCalorie = tdee - 500;
                proteinPerKg = 2.2;
                fatPerKg = 0.7;
                break;
            case "lose fat":
                dailyCalorie = tdee - 250;
                proteinPerKg = 2.0;
                fatPerKg = 0.7;
                break;
            case "stay healthy":
                dailyCalorie = tdee;
                proteinPerKg = 1.2;
                fatPerKg = 0.8;
                break;
            case "gain muscle":
                dailyCalorie = tdee + 250;
                proteinPerKg = 1.8;
                fatPerKg = 1.0;
                break;
            case "gain weight":
                dailyCalorie = tdee + 500;
                proteinPerKg = 1.7;
                fatPerKg = 1.0;
                break;
        }

        const protein = weight * proteinPerKg;
        const fat = weight * fatPerKg;
        const proteinCal = protein * 4;
        const fatCal = fat * 9;
        const carbCal = Math.max(0, dailyCalorie - (proteinCal + fatCal));
        const carb = carbCal / 4;

        return {
            BMR: Math.round(bmr),
            dailyCalorie: Math.round(dailyCalorie),
            protCible: Math.round(protein),
            fatCible: Math.round(fat),
            carbCible: Math.round(carb),
            protCalorie: Math.round(proteinCal),
            fatCalorie: Math.round(fatCal),
            carbCalorie: Math.round(carbCal)
        };
    }

    static getExerciseParameters(goal) {
        switch (goal) {
            case "gain muscle":
            case "gain weight":
                return { sets: "3-4", reps: "8-12", rest: "90s" };
            case "lose fat":
            case "lose weight":
                return { sets: "3", reps: "12-15", rest: "60s" };
            case "stay healthy":
            default:
                return { sets: "3", reps: "10-12", rest: "90s" };
        }
    }

    static getAFConstraints(af) {
        const val = parseFloat(af);
        if (val <= 1.2) return { min: 0, max: 1, label: "Sedentary (Max 1 day)" };
        if (val <= 1.3) return { min: 1, max: 3, label: "Light Activity (1-3 days)" };
        if (val <= 1.375) return { min: 3, max: 5, label: "Moderate Activity (3-5 days)" };
        if (val <= 1.45) return { min: 5, max: 6, label: "Active (5-6 days)" };
        return { min: 6, max: 7, label: "Athlete (6-7 days)" };
    }

    static async cherryPickWorkout(exercicesDB, daysAvailable, goal) {
        const params = this.getExerciseParameters(goal);
        const plan = {};
        let typeSplit = "";

        const getRandom = (arr) => arr && arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;
        
        const filterEx = (category, type) => {
            return exercicesDB.filter(ex => ex.category === category && (!type || ex.type === type));
        };

        const buildDay = (structure) => {
            return structure.map(s => {
                const pool = filterEx(s.cat, s.type);
                const ex = getRandom(pool);
                return ex ? {
                    name: ex.nomExercice,
                    muscle: ex.muscle,
                    angle: ex.angle,
                    type: ex.type,
                    category: ex.category,
                    ...params
                } : null;
            }).filter(Boolean);
        };

        if (daysAvailable <= 3) {
            typeSplit = "Full Body Protocol";
            const fullBodyStructure = [
                { cat: 'Chest', type: 'Compound' },
                { cat: 'Back', type: 'Compound' },
                { cat: 'Legs', type: 'Compound' },
                { cat: 'Shoulders', type: 'Compound' },
                { cat: 'Arms', type: 'Isolation' },
                { cat: 'Core', type: 'Isolation' }
            ];
            for (let i = 1; i <= 7; i++) {
                if (daysAvailable === 1 && i === 1) plan[`day${i}`] = buildDay(fullBodyStructure);
                else if (daysAvailable === 2 && (i === 1 || i === 4)) plan[`day${i}`] = buildDay(fullBodyStructure);
                else if (daysAvailable === 3 && (i === 1 || i === 3 || i === 5)) plan[`day${i}`] = buildDay(fullBodyStructure);
                else plan[`day${i}`] = "repos";
            }
        } else if (daysAvailable === 4) {
            typeSplit = "Upper / Lower Split";
            const upper = [{ cat: 'Chest', type: 'Compound' }, { cat: 'Back', type: 'Compound' }, { cat: 'Shoulders', type: 'Compound' }, { cat: 'Arms', type: 'Isolation' }];
            const lower = [{ cat: 'Legs', type: 'Compound' }, { cat: 'Legs', type: 'Isolation' }, { cat: 'Core', type: 'Isolation' }, { cat: 'Traps', type: 'Isolation' }];
            plan.day1 = buildDay(upper);
            plan.day2 = buildDay(lower);
            plan.day3 = "repos";
            plan.day4 = buildDay(upper);
            plan.day5 = buildDay(lower);
            plan.day6 = "repos";
            plan.day7 = "repos";
        } else if (daysAvailable === 5) {
            typeSplit = "Advanced Hybrid Split";
            const upper = [{ cat: 'Chest', type: 'Compound' }, { cat: 'Back', type: 'Compound' }];
            const lower = [{ cat: 'Legs', type: 'Compound' }, { cat: 'Core', type: 'Isolation' }];
            const push = [{ cat: 'Chest', type: 'Isolation' }, { cat: 'Shoulders', type: 'Compound' }, { cat: 'Arms', type: 'Isolation' }];
            const pull = [{ cat: 'Back', type: 'Isolation' }, { cat: 'Traps', type: 'Isolation' }, { cat: 'Arms', type: 'Isolation' }];
            const legs = [{ cat: 'Legs', type: 'Compound' }, { cat: 'Legs', type: 'Isolation' }];
            plan.day1 = buildDay(upper);
            plan.day2 = buildDay(lower);
            plan.day3 = buildDay(push);
            plan.day4 = buildDay(pull);
            plan.day5 = buildDay(legs);
            plan.day6 = "repos";
            plan.day7 = "repos";
        } else if (daysAvailable === 6) {
            typeSplit = "High Volume PPL";
            const push = [{ cat: 'Chest', type: 'Compound' }, { cat: 'Shoulders', type: 'Compound' }, { cat: 'Arms', type: 'Isolation' }];
            const pull = [{ cat: 'Back', type: 'Compound' }, { cat: 'Traps', type: 'Isolation' }, { cat: 'Arms', type: 'Isolation' }];
            const legs = [{ cat: 'Legs', type: 'Compound' }, { cat: 'Legs', type: 'Isolation' }, { cat: 'Core', type: 'Isolation' }];
            plan.day1 = buildDay(push); plan.day2 = buildDay(pull); plan.day3 = buildDay(legs);
            plan.day4 = buildDay(push); plan.day5 = buildDay(pull); plan.day6 = buildDay(legs);
            plan.day7 = "repos";
        } else {
            typeSplit = "Pro Athlete Protocol";
            const push = [{ cat: 'Chest', type: 'Compound' }, { cat: 'Shoulders', type: 'Compound' }];
            const pull = [{ cat: 'Back', type: 'Compound' }, { cat: 'Arms', type: 'Isolation' }];
            const legs = [{ cat: 'Legs', type: 'Compound' }, { cat: 'Core', type: 'Isolation' }];
            const push2 = [{ cat: 'Chest', type: 'Isolation' }, { cat: 'Shoulders', type: 'Isolation' }, { cat: 'Arms', type: 'Isolation' }];
            const pull2 = [{ cat: 'Back', type: 'Isolation' }, { cat: 'Traps', type: 'Isolation' }];
            const legs2 = [{ cat: 'Legs', type: 'Isolation' }, { cat: 'Core', type: 'Isolation' }];
            const full = [{ cat: 'Chest', type: 'Compound' }, { cat: 'Back', type: 'Compound' }, { cat: 'Legs', type: 'Compound' }];
            
            plan.day1 = buildDay(push);
            plan.day2 = buildDay(pull);
            plan.day3 = buildDay(legs);
            plan.day4 = buildDay(push2);
            plan.day5 = buildDay(pull2);
            plan.day6 = buildDay(legs2);
            plan.day7 = buildDay(full);
        }

        return { plan, type: typeSplit };
    }
}
