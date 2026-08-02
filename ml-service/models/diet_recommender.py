"""
Diet Recommendation Engine
Generates personalized diabetic-friendly meal plans
"""


class DietRecommender:
    """Generate personalized diet plans for diabetic patients"""

    # Food database with glycemic index and nutritional info
    FOODS = {
        'breakfast': [
            {'name': 'Oatmeal with berries', 'quantity': '1 cup', 'calories': 250, 'carbs': 40, 'protein': 8, 'fat': 5, 'gi': 55},
            {'name': 'Greek yogurt with nuts', 'quantity': '1 cup', 'calories': 200, 'carbs': 20, 'protein': 15, 'fat': 8, 'gi': 36},
            {'name': 'Whole grain toast with avocado', 'quantity': '2 slices', 'calories': 280, 'carbs': 35, 'protein': 8, 'fat': 12, 'gi': 50},
            {'name': 'Egg white omelette with vegetables', 'quantity': '1 serving', 'calories': 180, 'carbs': 8, 'protein': 20, 'fat': 6, 'gi': 15},
            {'name': 'Smoothie (spinach, berries, protein)', 'quantity': '1 glass', 'calories': 220, 'carbs': 30, 'protein': 15, 'fat': 4, 'gi': 40},
        ],
        'lunch': [
            {'name': 'Grilled chicken salad', 'quantity': '1 bowl', 'calories': 350, 'carbs': 20, 'protein': 35, 'fat': 12, 'gi': 25},
            {'name': 'Quinoa bowl with vegetables', 'quantity': '1 bowl', 'calories': 400, 'carbs': 55, 'protein': 15, 'fat': 10, 'gi': 53},
            {'name': 'Lentil soup with whole grain bread', 'quantity': '1 serving', 'calories': 380, 'carbs': 50, 'protein': 18, 'fat': 8, 'gi': 32},
            {'name': 'Tuna salad wrap (whole wheat)', 'quantity': '1 wrap', 'calories': 350, 'carbs': 35, 'protein': 30, 'fat': 10, 'gi': 45},
            {'name': 'Brown rice with grilled fish', 'quantity': '1 plate', 'calories': 420, 'carbs': 50, 'protein': 30, 'fat': 10, 'gi': 50},
        ],
        'snack': [
            {'name': 'Mixed nuts (almonds, walnuts)', 'quantity': '30g', 'calories': 180, 'carbs': 8, 'protein': 6, 'fat': 15, 'gi': 15},
            {'name': 'Apple with peanut butter', 'quantity': '1 apple + 2 tbsp', 'calories': 250, 'carbs': 30, 'protein': 7, 'fat': 12, 'gi': 38},
            {'name': 'Carrot sticks with hummus', 'quantity': '1 serving', 'calories': 150, 'carbs': 18, 'protein': 5, 'fat': 7, 'gi': 25},
            {'name': 'Boiled eggs', 'quantity': '2 eggs', 'calories': 140, 'carbs': 1, 'protein': 12, 'fat': 10, 'gi': 0},
            {'name': 'Cottage cheese with cucumber', 'quantity': '1 cup', 'calories': 120, 'carbs': 6, 'protein': 14, 'fat': 4, 'gi': 30},
        ],
        'dinner': [
            {'name': 'Baked salmon with steamed broccoli', 'quantity': '1 serving', 'calories': 380, 'carbs': 15, 'protein': 35, 'fat': 18, 'gi': 15},
            {'name': 'Chicken stir-fry with vegetables', 'quantity': '1 plate', 'calories': 400, 'carbs': 30, 'protein': 30, 'fat': 15, 'gi': 35},
            {'name': 'Turkey meatballs with zucchini noodles', 'quantity': '1 serving', 'calories': 350, 'carbs': 20, 'protein': 30, 'fat': 15, 'gi': 25},
            {'name': 'Grilled tofu with brown rice', 'quantity': '1 plate', 'calories': 380, 'carbs': 45, 'protein': 20, 'fat': 12, 'gi': 50},
            {'name': 'Lean beef with sweet potato', 'quantity': '1 serving', 'calories': 420, 'carbs': 40, 'protein': 30, 'fat': 14, 'gi': 44},
        ],
    }

    def recommend(self, data):
        """Generate a personalized meal plan"""
        age = data.get('age', 45)
        gender = data.get('gender', 'male')
        weight = data.get('weight', 70)
        height = data.get('height', 170)
        bmi = data.get('bmi', 25)
        diabetes_type = data.get('diabetesType', 'type2')
        allergies = data.get('allergies', [])
        conditions = data.get('conditions', [])
        is_pregnant = data.get('isPregnant', False)
        pregnancy_weeks = data.get('pregnancyWeeks', 0)

        # Calculate daily caloric needs (Harris-Benedict)
        if is_pregnant or gender == 'female':
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
        else:
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)

        # Activity multiplier (moderate default)
        tdee = bmr * 1.55

        # Adjust for pregnancy or BMI
        if is_pregnant:
            # Caloric needs increase by trimester
            if pregnancy_weeks <= 12:
                trimester = 1
                extra_calories = 100
            elif pregnancy_weeks <= 26:
                trimester = 2
                extra_calories = 340
            else:
                trimester = 3
                extra_calories = 450
            tdee += extra_calories
        else:
            if bmi > 30:
                tdee -= 300  # caloric deficit for weight loss
            elif bmi < 18.5:
                tdee += 200  # caloric surplus

        target_calories = round(tdee)
        
        # Macronutrient ratio changes during pregnancy
        if is_pregnant:
            target_carbs = round(target_calories * 0.45 / 4)  # 45% from carbs (safe for gestational diabetes)
            target_protein = round(target_calories * 0.25 / 4)  # 25% from protein (elevated for fetal tissue build)
            target_fat = round(target_calories * 0.30 / 9)  # 30% from healthy fats
        else:
            target_carbs = round(target_calories * 0.40 / 4)  # 40% from carbs
            target_protein = round(target_calories * 0.30 / 4)  # 30% from protein
            target_fat = round(target_calories * 0.30 / 9)  # 30% from fat

        # Build meal plan
        import random
        meals = []
        meal_calories = {'Breakfast': 0.25, 'Lunch': 0.30, 'Snack': 0.15, 'Dinner': 0.30}

        for meal_name, ratio in meal_calories.items():
            meal_type = meal_name.lower()
            options = self.FOODS.get(meal_type, self.FOODS['snack'])
            selected = random.choice(options)

            # Filter out allergens
            if allergies:
                filtered = [f for f in options if not any(a.lower() in f['name'].lower() for a in allergies)]
                if filtered:
                    selected = random.choice(filtered)

            meals.append({
                'name': meal_name,
                'time': {'Breakfast': '08:00', 'Lunch': '13:00', 'Snack': '16:00', 'Dinner': '19:00'}.get(meal_name, '12:00'),
                'calories': selected['calories'],
                'carbs': selected['carbs'],
                'protein': selected['protein'],
                'fat': selected['fat'],
                'glycemicIndex': selected['gi'],
                'items': [{'name': selected['name'], 'quantity': selected['quantity'], 'calories': selected['calories']}],
            })

        if is_pregnant:
            restrictions = [
                'Avoid unpasteurized milk and soft cheeses (e.g. Brie, Feta, Blue cheese)',
                'Avoid raw or undercooked meats, raw eggs, and raw seafood/sushi',
                'Avoid high-mercury fish (e.g. swordfish, tilefish, king mackerel)',
                'Limit caffeine intake to under 200mg per day',
                'Avoid alcohol and unpasteurized juices completely',
                'Avoid pre-packaged salads and raw sprouts (high risk of listeria)'
            ]
            recommendations = [
                'Ensure adequate intake of folate-rich foods (spinach, asparagus, broccoli)',
                'Consume calcium-rich foods (pasteurized yogurt, fortified soy milk) for baby\'s bone growth',
                'Increase iron intake (lean meats, beans, dark greens) combined with vitamin C to aid absorption',
                'Take a daily prenatal vitamin containing folic acid, iron, and DHA',
                'Eat small, frequent meals to control gestational blood sugar levels and alleviate nausea',
                'Drink plenty of fluids (10+ glasses of water daily) to support amniotic fluid'
            ]
        else:
            restrictions = ['Limit refined sugars and white flour', 'Avoid sugary beverages', 'Limit processed foods']
            if diabetes_type == 'type1':
                restrictions.append('Count carbohydrates carefully for insulin dosing')

            recommendations = [
                'Eat at regular intervals (every 3-4 hours)',
                'Include fiber-rich foods in every meal',
                'Stay hydrated (8+ glasses of water daily)',
                'Monitor blood sugar before and 2 hours after meals',
                'Pair carbohydrates with protein or healthy fats',
            ]

        if is_pregnant:
            title = f'Personalized Prenatal & Diabetic Meal Plan ({target_calories} cal/day)'
            description = f'Tailored for pregnancy (Trimester {trimester}, {pregnancy_weeks} weeks), age {age}, weight {weight}kg. Focuses on nutrient-dense, pasteurized, and low-glycemic foods.'
        else:
            title = f'Personalized Diabetic Meal Plan ({target_calories} cal/day)'
            description = f'Tailored for {gender}, age {age}, BMI {bmi:.1f}. Focus on low-glycemic foods for blood sugar stability.'

        return {
            'title': title,
            'description': description,
            'totalCalories': target_calories,
            'totalCarbs': target_carbs,
            'totalProtein': target_protein,
            'totalFat': target_fat,
            'glycemicLoad': round(sum(m.get('glycemicIndex', 0) for m in meals) / len(meals), 1),
            'meals': meals,
            'restrictions': restrictions,
            'recommendations': recommendations,
        }
