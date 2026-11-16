// Batch 4: 6 Tips + 6 P.O.V. + 6 Myth vs Fact. One scene per voice line. Numbers come from the app's engines.
const CTA = { vo: "Comment fit, and I'll send you the link." };
const W = (x) => [x, 'w'], G = (x) => [x, 'g'], L = (x) => [x, 'l'];
const SAVE = '[ Save this ]', POVL = '[ POV ]';
const EX170 = 'Example: man, 28, 5′10″, 170 lb, 3 workouts a week';
window.SPECS = {
// ============================== TIPS ==============================
'tips6': { scenes: [ // Form library
  { vo: "Your squat feels off? Three cues fix it. Save this.", label: SAVE, head: [W('Fix your'), L('goblet squat.')], v: { type: 'form', kind: 'squat', cue: -1, top: 640, cues: ['Hold the dumbbell tight to your chest', 'Sit down between your heels, chest tall', 'Push the floor away to stand up'] } },
  { vo: "One: hold the dumbbell tight to your chest.", same: { cue: 0 } },
  { vo: "Two: sit down between your heels, chest tall.", same: { cue: 1 } },
  { vo: "Three: push the floor away to stand up.", same: { cue: 2 } },
  { vo: "Fit Planner has a form guide like this for every move in your plan.", head: [W('A form guide'), L('for every move.')], v: { type: 'checks', cap: 'Your plan · form guides', items: [['Goblet Squat', 1, '3 cues + animation'], ['Dumbbell Floor Press', 1, '3 cues + animation'], ['One-Arm Dumbbell Row', 1, '3 cues + animation'], ['Dumbbell Romanian Deadlift', 1, '3 cues + animation']] } },
  CTA ] },
'tips7': { scenes: [ // Smart Progression
  { vo: "When should you add weight? Stop guessing. Save this.", label: SAVE, head: [W('When do you'), L('add weight?')], v: { type: 'big', text: '+5 lb?', top: 1000 } },
  { vo: "Hit the top of your range on every set? Add five pounds.", label: 'Rule 01 / 04', head: [W('Top of the range,'), L('every set?')], v: { type: 'sets', cap: 'Goblet Squat · 30 lb · range 8–12', reps: [12, 12, 12], top_: 12, target: 8, result: 'Next session: 35 lb × 8' } },
  { vo: "Hit your target, but not the top? Same weight, one more rep.", label: 'Rule 02 / 04', head: [W('Hit your target?'), L('One more rep.')], v: { type: 'sets', cap: 'Goblet Squat · 30 lb · target 8', reps: [9, 8, 8], top_: 12, target: 8, result: 'Next session: 30 lb × 10' } },
  { vo: "Missed reps? Keep the weight, and own it.", label: 'Rule 03 / 04', head: [W('Missed reps?'), L('Same weight.')], v: { type: 'sets', cap: 'Goblet Squat · 30 lb · range 8–12', reps: [9, 7, 6], top_: 12, target: 8, result: 'Next session: 30 lb × 8', tone: 'down' } },
  { vo: "Three tough sessions in a row? Go about ten percent lighter, and rebuild.", label: 'Rule 04 / 04', head: [W('3 tough sessions?'), L('Go lighter.')], v: { type: 'load', from: '30 lb', to: '25 lb', down: 1, sub: 'About −10%, rounded to your dumbbells', tag: 'Rebuild clean reps' } },
  { vo: "Fit Planner reads the sets you log, and sets your next target for you.", head: [W('It reads your log.'), L('You just lift.')], v: { type: 'notif', title: 'Next: Goblet Squat · 35 lb × 8', sub: 'You hit 12 on every set. +5 lb.' } },
  CTA ] },
'tips8': { scenes: [ // Muscle map
  { vo: "Is your plan skipping a muscle? Check this. Save this.", label: SAVE, head: [W('Is your plan'), L('skipping a muscle?')], v: { type: 'big', text: '?', size: 320, top: 950 } },
  { vo: "Count the sets each muscle gets in a week.", label: 'Step 01 / 03', head: [W('Count sets'), L('per muscle.')], size: 120, v: { type: 'bars', top: 640, gap: 20, lw: 260, fs: 32, h: 38, items: [['Glutes', 14.5], ['Quads', 9], ['Triceps', 8.5], ['Hamstrings', 8.5], ['Shoulders', 7.5], ['Chest', 6], ['Lats', 6], ['Upper back', 4], ['Calves', 0]], hl: 8 }, note: '3-day plan, 2 dumbbells (25 lb), week 1', noteTop: 1560 },
  { vo: "A row counts as one set for your back, and half a set for your biceps.", label: 'Step 02 / 03', head: [W('Helpers count'), L('as half.')], v: { type: 'bars', top: 820, items: [['Lats', 1, '1'], ['Upper back', .5, '½'], ['Biceps', .5, '½'], ['Shoulders', .25, '¼']] }, note: 'One set of One-Arm Dumbbell Row', noteTop: 1300 },
  { vo: "On this three-day dumbbell plan, calves get zero. Now you know.", label: 'Step 03 / 03', head: [W('Calves:'), L('zero sets.')], v: { type: 'big', text: '0', size: 420, top: 820, color: '#FF7A1A', wobble: 2 } },
  { vo: "Fit Planner's muscle map lights up every muscle your plan trains, day by day.", head: [W('Your muscle map,'), L('day by day.')], v: { type: 'tiles', top: 700, items: [['Glutes', 14.5, 3], ['Quads', 9, 3], ['Triceps', 8.5, 3], ['Hamstrings', 8.5, 3], ['Shoulders', 7.5, 2], ['Chest', 6, 2], ['Lats', 6, 2], ['Upper back', 4, 2], ['Biceps', 3, 1], ['Abs & core', 3, 1], ['Lower back', 3, 1], ['Calves', 0, 0]] } },
  CTA ] },
'tips9': { scenes: [ // Deload
  { vo: "Week four should feel easier. Here's why. Save this.", label: SAVE, head: [W('Why week 4'), L('feels lighter.')], v: { type: 'weeks', top: 900, items: [['Week 1', '3×8', '30 lb'], ['Week 2', '3×10', '30 lb'], ['Week 3', '3×12', '30 lb'], ['Week 4', '?', '']], hl: 3 } },
  { vo: "After three weeks of pushing, your body needs to catch up.", head: [W('3 weeks of'), L('pushing.')], v: { type: 'weeks', top: 900, cap: 'Goblet Squat', items: [['Week 1', '3×8', '30 lb', 'Learn the moves'], ['Week 2', '3×10', '30 lb', 'Add reps'], ['Week 3', '3×12', '30 lb', 'Top of the range']], hl: 2 } },
  { vo: "So you drop a set, and go a little lighter.", head: [W('Drop a set.'), L('Go lighter.')], v: { type: 'load', from: '3×12 · 30', to: '2×8 · 25', down: 1, sub: 'Week 3 → week 4 (deload)' } },
  { vo: "Then you start your next block fresh, not worn out.", head: [W('Start fresh,'), L('not worn out.')], v: { type: 'weeks', top: 900, items: [['Week 1', '3×8', ''], ['Week 2', '3×10', ''], ['Week 3', '3×12', ''], ['Week 4', '2×8', 'Deload']], hl: 3 } },
  { vo: "Fit Planner can build a deload week right into your plan.", head: [W('Built in,'), L('one tap.')], v: { type: 'toggle', label: 'Deload week 4', sub: 'One set fewer, lighter weights' } },
  CTA ] },
'tips10': { scenes: [ // Protein + meals + swaps + Ate it
  { vo: "Hit your protein without weighing every bite. Save this.", label: SAVE, head: [W('Hit your protein'), L('without the math.')], v: { type: 'big', text: '136 g', size: 260, top: 980 }, note: EX170 + ', building muscle', noteTop: 1400 },
  { vo: "Build every meal around one protein.", label: 'Rule 01 / 03', head: [W('One protein'), L('per meal.')], v: { type: 'bars', top: 760, lw: 330, items: [['Chicken, 4 oz', 35, '35 g'], ['Firm tofu, 6 oz', 29, '29 g'], ['Cottage cheese, 1 cup', 28, '28 g'], ['Tuna, 1 can', 26, '26 g'], ['Greek yogurt, 1 cup', 23, '23 g'], ['2 whole eggs', 12.6, '13 g']] } },
  { vo: "Don't like it? Swap it, and resize the portion so the protein stays close.", label: 'Rule 02 / 03', head: [W('Swap it.'), L('Resize it.')], v: { type: 'meal', time: '12–2 pm', title: 'Lunch', kcal: 992, prot: 53, items: [['Chicken breast', '4 oz', 35], ['Brown rice', '2½ cups', 13], ['Mixed green salad', '2 cups', 2], ['Avocado', '1 whole', 3]] } },
  { vo: "Chicken becomes seven ounces of tofu. Still fifty grams for the meal.", same: { swap: { kcal: 931, prot: 50, map: { 0: ['Firm tofu', '7 oz', 34], 3: ['Avocado', '⅓ whole', 1] } } } },
  { vo: "Fit Planner sizes every swap for you, and your rings fill when you tap ate it.", label: 'Rule 03 / 03', head: [W('Tap “Ate it.”'), L('Rings fill.')], v: { type: 'rings', kcal: 2790, p: 136, c: 373, f: 84, fill: .33, cap: 'Today · lunch logged' } },
  CTA ] },
'tips11': { scenes: [ // Calorie targets + weight update
  { vo: "How much should you eat? It depends on your goal. Save this.", label: SAVE, head: [W('How much'), L('should you eat?')], v: { type: 'big', text: 'kcal?', size: 240, top: 1000 } },
  { vo: "Start from maintenance. For this example, about twenty-five thirty a day.", label: 'Step 01 / 03', head: [W('Start from'), L('maintenance.')], v: { type: 'calc', eq: 'Maintenance', value: 2530, unit: 'kcal a day' }, note: EX170, noteTop: 1520 },
  { vo: "Building muscle? About ten percent more.", label: 'Step 02 / 03', head: [W('Building muscle?'), L('About +10%.')], v: { type: 'calc', eq: '2,530 × 1.1', value: 2790, unit: 'kcal a day' } },
  { vo: "Losing fat? About twenty percent less, with high protein.", label: 'Step 03 / 03', head: [W('Losing fat?'), L('About −20%.')], v: { type: 'calc', eq: '2,530 × 0.8', value: 2030, unit: 'kcal a day · 170 g protein' } },
  { vo: "Fit Planner does this for you, and resizes everything when your weight changes.", head: [W('Weight changes?'), L('Plan resizes.')], v: { type: 'load', from: '170 lb', to: '185 lb', sub: '2,790 → 2,900 kcal · protein 136 → 148 g', tag: 'Every meal re-sized' } },
  CTA ] },
// ============================== P.O.V. ==============================
'pov6': { scenes: [ // History + strength charts + CSV export
  { vo: "P-O-V: you open your history, and the line only goes up.", label: POVL, head: [W('Your history.'), L('Only up.')], v: { type: 'chart', top: 760, cap: 'Goblet Squat · estimated max (lb)', pts: [['W1', 38, '30×8'], ['W2', 40, '30×10'], ['W3', 42, '30×12'], ['W4', 44, '35×8']], n: 1, pr: 'New best' } },
  { vo: "Week one: thirty pounds for eight.", same: { n: 1, from: 0 } },
  { vo: "Week four: thirty-five pounds for eight. New best.", same: { n: 4, from: 1 } },
  { vo: "Every set you log turns into a strength chart. And you can export it all to a spreadsheet.", head: [W('Every set,'), L('saved.')], v: { type: 'csv', cap: 'fitplanr-sets.csv', rows: ['date, exercise, set, reps, lb', '11-02, Goblet Squat, 1, 8, 30', '11-09, Goblet Squat, 1, 10, 30', '11-16, Goblet Squat, 1, 12, 30', '11-23, Goblet Squat, 1, 8, 35'] } },
  CTA ] },
'pov7': { scenes: [ // Protect lower back
  { vo: "P-O-V: your lower back hates every deadlift.", label: POVL, head: [W('Your lower back'), G('vs. every'), G('deadlift.')] , v: { type: 'chips', items: ['Skip legs again?', 'Just stretch it?', 'Is it my form?', 'Rows hurt too?', 'Leg day = back day'] } },
  { vo: "So I told my plan to go easy on my lower back.", head: [W('Go easy on'), L('my lower back.')], v: { type: 'checks', box: 1, cap: 'Anything to protect?', items: [['Lower back', 1], ['Knees', 0], ['Shoulders', 0]] } },
  { vo: "No heavy barbell hinges, no bent-over rows. Cable pull-throughs and chest-supported rows instead.", head: [W('Same muscles.'), L('Kinder moves.')], v: { type: 'swaps', items: [['Barbell Romanian Deadlift', 'Cable Pull-Through'], ['Barbell Row', 'Chest-Supported Dumbbell Row'], ['Barbell Back Squat', 'Goblet Squat']] }, note: 'Pain that sticks around? See a professional first.', noteTop: 1660 },
  CTA ] },
'pov8': { scenes: [ // Form guide (hinge)
  { vo: "P-O-V: you're mid-rep, and suddenly not sure your form is right.", label: POVL, head: [W('Mid-rep.'), G('Is this right?')], v: { type: 'chips', items: ['Back flat?', 'Knees bent?', 'Too low?', 'Where do I look?', 'Is it my hips?'] } },
  { vo: "So I tap the exercise, and watch the form guide.", head: [W('Dumbbell'), L('Romanian deadlift.')], size: 116, v: { type: 'form', kind: 'hinge', cue: -1, top: 600, cues: ['Soft knees, push your hips back', 'Dumbbells slide down your thighs', 'Stop when you feel your hamstrings stretch'] } },
  { vo: "Soft knees. Push your hips back.", same: { cue: 0 } },
  { vo: "Dumbbells slide down your thighs. Stop when your hamstrings stretch.", same: { cue: 2 } },
  CTA ] },
'pov9': { scenes: [ // New gear → rebuild
  { vo: "P-O-V: you moved, and all you kept is a kettlebell and a band.", label: POVL, head: [W('New place.'), G('One kettlebell.'), G('One band.')], v: { type: 'big', text: '📦', size: 240, top: 1050 } },
  { vo: "Your old plan? Built for a full gym.", head: [W('Your old plan:'), G('full gym only.')], v: { type: 'checks', cap: 'Old plan · Day 1', items: [['Barbell Back Squat', 0], ['Barbell Bench Press', 0], ['Barbell Row', 0], ['Lat Pulldown', 0]] } },
  { vo: "So I rebuilt my plan around what I have.", head: [W('Rebuilt around'), L('what I have.')], v: { type: 'toggles', items: [['Kettlebell', 1], ['Resistance bands', 1], ['Barbell', 0], ['Dumbbells', 0], ['Pull-up bar', 0], ['Machines', 0]] } },
  { vo: "Kettlebell goblet squats, band presses, band rows. Same goal, new gear.", v: { type: 'card', top: 360, day: 'Day 1 · Mon', title: 'Full Body A', mins: '37 min', rows: [['Kettlebell Goblet Squat', '3 × 8', 'your kettlebell', '90s'], ['Band Chest Press', '3 × 8', 'medium band', '90s'], ['Band Row', '3 × 8', 'medium band', '90s'], ['Kettlebell Deadlift', '3 × 8', 'your kettlebell', '90s'], ['Band Face Pull', '2 × 10', 'medium band', '60s']] } },
  CTA ] },
'pov10': { scenes: [ // Custom split: move days + swap exercise
  { vo: "P-O-V: you play soccer every Tuesday, but Tuesday is leg day.", label: POVL, head: [W('Soccer Tuesday.'), G('Also leg day.')], v: { type: 'days', map: { 0: 'Upper A', 1: 'Lower A', 3: 'Upper B', 4: 'Lower B' } } },
  { vo: "Two leg workouts in one day? No thanks.", head: [W('Two leg days'), G('in one day?')], v: { type: 'big', text: '⚽ + 🦵', size: 200, top: 1000 } },
  { vo: "So I moved my days. Legs on Thursday now.", head: [W('Moved my days.'), L('Legs on Thursday.')], v: { type: 'days', map: { 0: 'Upper A', 1: 'Upper B', 3: 'Lower A', 4: 'Lower B' } , flash: [1, 3] }, same0: 1 },
  { vo: "And I swapped back squats for the leg press. Same plan, built around my week.", head: [W('Swap any move.'), L('Keep the plan.')], v: { type: 'swaps', items: [['Barbell Back Squat', 'Leg Press']] } },
  CTA ] },
'pov11': { scenes: [ // Dinner: meal plan + swap
  { vo: "P-O-V: it's six p.m., and you have no idea what's for dinner.", label: POVL, head: [W('6 pm.'), G("What's for dinner?")], v: { type: 'chips', items: ['Cereal again?', 'Order pizza?', 'Skip it?', 'Protein bar?', 'Toast…?'] } },
  { vo: "My plan already has it: salmon, sweet potato, broccoli. Forty-nine grams of protein.", head: [W('Dinner:'), L('already planned.')], v: { type: 'meal', time: '6–8 pm', title: 'Dinner', kcal: 858, prot: 49, items: [['Salmon', '6 oz', 38], ['Sweet potato', '3 medium', 7], ['Broccoli', '1 cup', 4], ['Olive oil', '½ tbsp', 0]] }, note: EX170 + ', building muscle', noteTop: 1640 },
  { vo: "Out of salmon? Swap for chicken. The meal resizes itself.", same: { swap: { kcal: 870, prot: 46, map: { 0: ['Chicken breast', '4 oz', 35], 3: ['Olive oil', '2 tbsp', 0] } } } },
  CTA ] },
// ============================== MYTH vs FACT ==============================
'myth1': { scenes: [
  { vo: "Myth: you need a gym to build muscle.", label: '[ Myth vs fact ]', head: [W('“You need a gym'), W('to build muscle.”')], v: { type: 'stamp', kind: 'MYTH' } },
  { vo: "Fact: you need a plan that gets harder every week.", head: [W('You need a plan'), L('that gets harder.')], v: { type: 'stamp', kind: 'FACT' } },
  { vo: "Push-ups: three sets of eight, then twelve, then fifteen, then four slow sets.", head: [W('Push-ups,'), L('week by week.')], v: { type: 'weeks', items: [['Week 1', '3×8', ''], ['Week 2', '3×12', ''], ['Week 3', '3×15', ''], ['Week 4', '4×15', '3 s down']], hl: 3 } },
  { vo: "Fit Planner builds that plan from whatever you own. Even nothing.", head: [W('Built from'), L('what you own.')], v: { type: 'toggles', items: [['Bodyweight only', 1], ['2 dumbbells', 0], ['Kettlebell', 0], ['Bands', 0], ['Pull-up bar', 0], ['Full gym', 0]] } },
  CTA ] },
'myth2': { scenes: [
  { vo: "Myth: the more you sweat, the better the workout.", label: '[ Myth vs fact ]', head: [W('“More sweat ='), W('better workout.”')], v: { type: 'stamp', kind: 'MYTH' } },
  { vo: "Fact: progress is more reps or more weight than last time.", head: [W('Progress ='), L('beat last time.')], v: { type: 'stamp', kind: 'FACT' } },
  { vo: "And that needs rest. Ninety seconds between big sets, so the next one is strong.", head: [W('Rest so the next'), L('set is strong.')], v: { type: 'dial', sec: 90, cap: 'BIG MOVES · 90 S' } },
  { vo: "Fit Planner times your rest, and tracks every rep.", head: [W('Rest timed.'), L('Reps tracked.')], v: { type: 'notif', title: 'Rest 1:30 · Goblet Squat', sub: 'Next: set 3 · 3 × 10 · 30 lb' } },
  CTA ] },
'myth3': { scenes: [
  { vo: "Myth: carbs make you fat.", label: '[ Myth vs fact ]', head: [W('“Carbs make'), W('you fat.”')], v: { type: 'stamp', kind: 'MYTH' } },
  { vo: "Fact: your total calories decide that.", head: [W('Total calories'), L('decide that.')], v: { type: 'stamp', kind: 'FACT' } },
  { vo: "On this muscle-building plan, carbs are the biggest share: three hundred seventy-three grams a day.", head: [W('Carbs:'), L('the biggest share.')], v: { type: 'bars', top: 820, items: [['Carbs', 373, '373 g'], ['Protein', 136, '136 g'], ['Fat', 84, '84 g']] }, note: EX170 + ', building muscle · 2,790 kcal', noteTop: 1300 },
  { vo: "Fit Planner sets your calories and macros, then sizes three meals to match.", head: [W('Your targets,'), L('3 meals sized.')], v: { type: 'rings', kcal: 2790, p: 136, c: 373, f: 84, fill: 1, cap: 'Daily target' } },
  CTA ] },
'myth4': { scenes: [
  { vo: "Myth: if you're not sore, it didn't work.", label: '[ Myth vs fact ]', head: [W('“Not sore ='), W('didn\'t work.”')], v: { type: 'stamp', kind: 'MYTH' } },
  { vo: "Fact: your log proves it worked, not your soreness.", head: [W('Your log'), L('is the proof.')], v: { type: 'stamp', kind: 'FACT' } },
  { vo: "More reps, or more weight, than last time. That's progress, sore or not.", head: [W('More reps.'), L('Then more weight.')], v: { type: 'weeks', cap: 'Goblet Squat', items: [['Week 1', '30×8', 'lb × reps'], ['Week 2', '30×10', ''], ['Week 3', '30×12', ''], ['Week 4', '35×8', '+5 lb']], hl: 3 } },
  { vo: "Fit Planner reads your log, and sets your next target automatically.", head: [W('Next target,'), L('set for you.')], v: { type: 'notif', title: 'Next: Goblet Squat · 35 lb × 8', sub: 'You hit 12 on every set. +5 lb.' } },
  CTA ] },
'myth5': { scenes: [
  { vo: "Myth: you have to train every muscle, every day.", label: '[ Myth vs fact ]', head: [W('“Train every'), W('muscle, every day.”')], size: 120, v: { type: 'stamp', kind: 'MYTH' } },
  { vo: "Fact: three full-body days a week can hit your big muscles again and again.", head: [W('3 full-body days'), L('cover the big ones.')], size: 120, v: { type: 'stamp', kind: 'FACT' } },
  { vo: "Glutes, quads, hamstrings, chest, back: each one trained on more than one day.", head: [W('Weekly sets,'), L('big muscles.')], v: { type: 'bars', top: 760, items: [['Glutes', 14.5], ['Quads', 9], ['Hamstrings', 8.5], ['Shoulders', 7.5], ['Chest', 6], ['Lats', 6]] }, note: '3-day plan, 2 dumbbells (25 lb), week 1', noteTop: 1500 },
  { vo: "Fit Planner's muscle map shows exactly what each day trains.", head: [W('See what'), L('each day trains.')], v: { type: 'tiles', top: 700, items: [['Glutes', 14.5, 3], ['Quads', 9, 3], ['Triceps', 8.5, 3], ['Hamstrings', 8.5, 3], ['Shoulders', 7.5, 2], ['Chest', 6, 2], ['Lats', 6, 2], ['Upper back', 4, 2], ['Biceps', 3, 1], ['Abs & core', 3, 1], ['Lower back', 3, 1], ['Calves', 0, 0]] } },
  CTA ] },
'myth6': { scenes: [
  { vo: "Myth: bad knees mean no leg day.", label: '[ Myth vs fact ]', head: [W('“Bad knees ='), W('no leg day.”')], v: { type: 'stamp', kind: 'MYTH' } },
  { vo: "Fact: you just need the right moves.", head: [W('You need'), L('the right moves.')], v: { type: 'stamp', kind: 'FACT' } },
  { vo: "No lunges, no deep loaded squats. Box squats, Romanian deadlifts and hip thrusts instead.", head: [W('Legs still'), L('get trained.')], v: { type: 'checks', items: [['Lunges', 0], ['Deep loaded squats', 0], ['Dumbbell Box Squat', 1], ['Dumbbell Romanian Deadlift', 1], ['Dumbbell Hip Thrust', 1]] }, note: 'Pain that sticks around? See a professional first.', noteTop: 1660 },
  { vo: "Tell Fit Planner what to go easy on, and it swaps the moves for you.", head: [W('Tell it once.'), L('It swaps for you.')], v: { type: 'checks', box: 1, cap: 'Anything to protect?', items: [['Lower back', 0], ['Knees', 1], ['Shoulders', 0]] } },
  CTA ] },
};
