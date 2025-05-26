import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Calendar, Weight, Dumbbell, Pill, Coffee, Save, X, ChevronDown, ChevronUp, Loader2, AlertCircle, Copy, Check, Target, Zap, Apple } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MealPlanner = () => {
  const [mealRecords, setMealRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedRecord, setExpandedRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    weight: '',
    workout: false,
    creatine: false,
    whey: false,
    breakfast: '',
    morningSnack: '',
    lunch: '',
    preWorkout: '',
    postWorkout: '',
    dinner: '',
    bedtimeSnack: '',
    calories: '',
    protein: '',
    notes: ''
  });

  const placeholders = {
    breakfast: '3 boiled eggs + oats + milk',
    morningSnack: '1 apple + 10 almonds',
    lunch: '2 roti + paneer curry + sabzi + curd',
    preWorkout: '1 scoop whey + banana',
    postWorkout: '4 egg whites + 1 toast + creatine',
    dinner: '2 phulkas + dal + lauki sabzi + salad',
    bedtimeSnack: '1 cup milk + 1 tsp chia seeds'
  };

  // Fetch all meal plans
  const fetchMealPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/meal-plans`);
      const data = await response.json();
      
      if (data.success) {
        // Transform backend data to frontend format
        const transformedData = data.data.map(plan => ({
          id: plan._id,
          date: plan.date,
          weight: plan.weight,
          workout: plan.workout,
          creatine: plan.creatine,
          whey: plan.whey,
          breakfast: plan.meals.breakfast,
          morningSnack: plan.meals.morningSnack,
          lunch: plan.meals.lunch,
          preWorkout: plan.meals.preWorkout,
          postWorkout: plan.meals.postWorkout,
          dinner: plan.meals.dinner,
          bedtimeSnack: plan.meals.bedtimeSnack,
          calories: plan.nutrition.calories,
          protein: plan.nutrition.protein,
          notes: plan.notes,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt
        }));
        setMealRecords(transformedData);
      } else {
        setError(data.message || 'Failed to fetch meal plans');
      }
    } catch (err) {
      setError('Failed to connect to server. Please check if the backend is running.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new meal plan
  const createMealPlan = async (data) => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/meal-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchMealPlans(); // Refresh the list
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (err) {
      console.error('Create error:', err);
      return { success: false, message: 'Failed to save meal plan' };
    } finally {
      setSaving(false);
    }
  };

  // Update meal plan
  const updateMealPlan = async (id, data) => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/meal-plans/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchMealPlans(); // Refresh the list
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (err) {
      console.error('Update error:', err);
      return { success: false, message: 'Failed to update meal plan' };
    } finally {
      setSaving(false);
    }
  };

  // Copy meal plan to clipboard
  const copyMealPlan = async (record) => {
    const mealText = `
🗓️ Date: ${record.date}
⚖️ Weight: ${record.weight} kg
${record.workout ? '💪 Workout Day' : '🛋️ Rest Day'}
${record.creatine ? '💊 Creatine ✓' : ''}
${record.whey ? '🥤 Whey Protein ✓' : ''}

🍳 BREAKFAST: ${record.breakfast || 'Not specified'}

🍎 MORNING SNACK: ${record.morningSnack || 'Not specified'}

🍽️ LUNCH: ${record.lunch || 'Not specified'}

⚡ PRE-WORKOUT: ${record.preWorkout || 'Not specified'}

🏋️ POST-WORKOUT: ${record.postWorkout || 'Not specified'}

🍛 DINNER: ${record.dinner || 'Not specified'}

🌙 BEDTIME SNACK: ${record.bedtimeSnack || 'Not specified'}

📊 NUTRITION:
${record.calories ? `• Calories: ${record.calories} kcal` : ''}
${record.protein ? `• Protein: ${record.protein}g` : ''}

${record.notes ? `📝 NOTES: ${record.notes}` : ''}
`.trim();

    try {
      await navigator.clipboard.writeText(mealText);
      setCopiedId(record.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = mealText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(record.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const resetForm = () => {
    setFormData({
      date: new Date().toLocaleDateString('en-GB'),
      weight: '',
      workout: false,
      creatine: false,
      whey: false,
      breakfast: '',
      morningSnack: '',
      lunch: '',
      preWorkout: '',
      postWorkout: '',
      dinner: '',
      bedtimeSnack: '',
      calories: '',
      protein: '',
      notes: ''
    });
  };

  const handleNewRecord = () => {
    resetForm();
    setEditingId(null);
    setShowForm(true);
    setError(null);
  };

  const handleEdit = (record) => {
    setFormData({
      date: record.date,
      weight: record.weight,
      workout: record.workout,
      creatine: record.creatine,
      whey: record.whey,
      breakfast: record.breakfast,
      morningSnack: record.morningSnack,
      lunch: record.lunch,
      preWorkout: record.preWorkout,
      postWorkout: record.postWorkout,
      dinner: record.dinner,
      bedtimeSnack: record.bedtimeSnack,
      calories: record.calories,
      protein: record.protein,
      notes: record.notes
    });
    setEditingId(record.id);
    setShowForm(true);
    setError(null);
  };

  const handleSave = async () => {
    setError(null);
    
    // Basic validation
    if (!formData.date || !formData.weight) {
      setError('Date and weight are required fields');
      return;
    }

    // Prepare data for API
    const apiData = {
      date: formData.date,
      weight: formData.weight,
      workout: formData.workout,
      creatine: formData.creatine,
      whey: formData.whey,
      breakfast: formData.breakfast,
      morningSnack: formData.morningSnack,
      lunch: formData.lunch,
      preWorkout: formData.preWorkout,
      postWorkout: formData.postWorkout,
      dinner: formData.dinner,
      bedtimeSnack: formData.bedtimeSnack,
      calories: formData.calories,
      protein: formData.protein,
      notes: formData.notes
    };

    let result;
    if (editingId) {
      result = await updateMealPlan(editingId, apiData);
    } else {
      result = await createMealPlan(apiData);
    }

    if (result.success) {
      setShowForm(false);
      resetForm();
      setEditingId(null);
    } else {
      setError(result.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
    setEditingId(null);
    setError(null);
  };

  const getRecentRecords = () => {
    return mealRecords.slice(0, 3);
  };

  const getOlderRecords = () => {
    return mealRecords.slice(3);
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr.split('/').reverse().join('-')).toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
    } catch {
      return dateStr;
    }
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 px-3 py-4 sm:p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-500" />
                {editingId ? 'Edit Meal Record' : 'New Meal Record'}
              </h2>
              <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4 sm:space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    Date *
                  </label>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Weight className="w-4 h-4 text-green-500" />
                    Weight (kg) *
                  </label>
                  <input
                    type="text"
                    placeholder="59.3"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base transition-colors"
                    required
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Activity & Supplements</label>
                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                      <input
                        type="checkbox"
                        checked={formData.workout}
                        onChange={(e) => setFormData({...formData, workout: e.target.checked})}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <Dumbbell className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-700 font-medium">Workout</span>
                    </label>
                    <label className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                      <input
                        type="checkbox"
                        checked={formData.creatine}
                        onChange={(e) => setFormData({...formData, creatine: e.target.checked})}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Pill className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-700 font-medium">Creatine</span>
                    </label>
                    <label className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                      <input
                        type="checkbox"
                        checked={formData.whey}
                        onChange={(e) => setFormData({...formData, whey: e.target.checked})}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <Coffee className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-700 font-medium">Whey</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Meals */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Apple className="w-5 h-5 text-red-500" />
                  Daily Meals
                </h3>
                
                {[
                  { key: 'breakfast', label: 'Breakfast (B)', icon: Coffee, color: 'text-amber-500' },
                  { key: 'morningSnack', label: 'Morning Snack (MS)', icon: Apple, color: 'text-green-500' },
                  { key: 'lunch', label: 'Lunch (L)', icon: Coffee, color: 'text-orange-500' },
                  { key: 'preWorkout', label: 'Pre-Workout (PreW)', icon: Zap, color: 'text-yellow-500' },
                  { key: 'postWorkout', label: 'Post-Workout (PostW)', icon: Dumbbell, color: 'text-red-500' },
                  { key: 'dinner', label: 'Dinner (D)', icon: Coffee, color: 'text-purple-500' },
                  { key: 'bedtimeSnack', label: 'Bedtime Snack (BB)', icon: Apple, color: 'text-indigo-500' }
                ].map(({ key, label, icon: Icon, color }) => (
                  <div key={key}>
                    <label className={`block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                      {label}
                    </label>
                    <textarea
                      value={formData[key]}
                      onChange={(e) => setFormData({...formData, [key]: e.target.value})}
                      placeholder={placeholders[key]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-sm sm:text-base transition-colors"
                      rows="2"
                    />
                  </div>
                ))}
              </div>

              {/* Nutrition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Approx Calories (kcal)
                  </label>
                  <input
                    type="text"
                    placeholder="2380"
                    value={formData.calories}
                    onChange={(e) => setFormData({...formData, calories: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Target className="w-4 h-4 text-red-500" />
                    Protein Estimate (g)
                  </label>
                  <input
                    type="text"
                    placeholder="132"
                    value={formData.protein}
                    onChange={(e) => setFormData({...formData, protein: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base transition-colors"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Energy good. Felt full. Need to add more fats maybe."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-sm sm:text-base transition-colors"
                  rows="3"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-400 transition-all flex items-center justify-center gap-2 text-sm sm:text-base font-semibold shadow-lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Record
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-50 transition-colors text-sm sm:text-base font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Dumbbell className="w-6 h-6 text-orange-500" />
                Meal Planner
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">Track your daily nutrition and fitness progress</p>
            </div>
            <button
              onClick={handleNewRecord}
              disabled={loading}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-400  flex items-center gap-2 text-sm sm:text-base font-semibold shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Record</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
            <span className="ml-2 text-gray-600">Loading meal plans...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={fetchMealPlans}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Recent Records (Last 3 days) */}
        {!loading && mealRecords.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              Recent Records
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {getRecentRecords().map((record) => (
                <div key={record.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="font-bold text-gray-900 text-sm sm:text-base">{formatDate(record.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Weight className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700 text-sm sm:text-base font-medium">{record.weight} kg</span>
                      </div>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {record.workout && <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium"><Dumbbell className="w-3 h-3" />Workout</div>}
                        {record.creatine && <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"><Pill className="w-3 h-3" />Creatine</div>}
                        {record.whey && <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"><Coffee className="w-3 h-3" />Whey</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => copyMealPlan(record)}
                        className="p-1.5 sm:p-2 hover:bg-green-100 rounded-full transition-colors"
                        title="Copy meal plan"
                      >
                        {copiedId === record.id ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500 hover:text-green-600" />
                        )}
                      </button>
                      <button
                        onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        {expandedRecord === record.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleEdit(record)}
                        className="p-1.5 sm:p-2 hover:bg-blue-100 rounded-full transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-gray-500 hover:text-blue-600" />
                      </button>
                    </div>
                  </div>

                  {expandedRecord === record.id && (
                    <div className="space-y-3 pt-3 sm:pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-bold text-gray-800 mb-2 text-sm sm:text-base flex items-center gap-2">
                            <Apple className="w-4 h-4 text-red-500" />
                            Meals
                          </h4>
                          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                            {record.breakfast && <div><span className="font-semibold text-amber-600">B:</span> {record.breakfast}</div>}
                            {record.morningSnack && <div><span className="font-semibold text-green-600">MS:</span> {record.morningSnack}</div>}
                            {record.lunch && <div><span className="font-semibold text-orange-600">L:</span> {record.lunch}</div>}
                            {record.preWorkout && <div><span className="font-semibold text-yellow-600">PreW:</span> {record.preWorkout}</div>}
                            {record.postWorkout && <div><span className="font-semibold text-red-600">PostW:</span> {record.postWorkout}</div>}
                            {record.dinner && <div><span className="font-semibold text-purple-600">D:</span> {record.dinner}</div>}
                            {record.bedtimeSnack && <div><span className="font-semibold text-indigo-600">BB:</span> {record.bedtimeSnack}</div>}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 mb-2 text-sm sm:text-base flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-500" />
                            Nutrition & Notes
                          </h4>
                          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                            {record.calories && <div className="flex items-center gap-2"><Zap className="w-3 h-3 text-yellow-500" /><span className="font-semibold">Calories:</span> {record.calories} kcal</div>}
                            {record.protein && <div className="flex items-center gap-2"><Target className="w-3 h-3 text-red-500" /><span className="font-semibold">Protein:</span> {record.protein}g</div>}
                            {record.notes && <div><span className="font-semibold">Notes:</span> {record.notes}</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {expandedRecord !== record.id && (
                    <div className="flex flex-wrap gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">
                      {record.calories && <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-500" />{record.calories} kcal</span>}
                      {record.protein && <span className="flex items-center gap-1"><Target className="w-3 h-3 text-red-500" />{record.protein}g protein</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Older Records */}
        {!loading && getOlderRecords().length > 0 && (
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              Previous Records
            </h2>
            <div className="bg-white rounded-xl shadow-md border border-gray-200">
              {getOlderRecords().map((record, index) => (
                <div key={record.id} className={`flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors ${index !== getOlderRecords().length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <span className="font-bold text-gray-900 text-sm sm:text-base">{formatDate(record.date)}</span>
                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Weight className="w-3 h-3 text-green-500" />
                        {record.weight} kg
                      </span>
                      {record.calories && <span className="text-gray-500 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        {record.calories} kcal
                      </span>}
                      {record.workout && <Dumbbell className="w-3 h-3 text-orange-500" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyMealPlan(record)}
                      className="p-1.5 sm:p-2 hover:bg-green-100 rounded-full transition-colors"
                      title="Copy meal plan"
                    >
                      {copiedId === record.id ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400 hover:text-green-600" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(record)}
                      className="p-1.5 sm:p-2 hover:bg-blue-100 rounded-full transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && mealRecords.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-10 h-10 text-orange-500" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">No meal records yet</h3>
            <p className="text-gray-600 mb-4 text-sm sm:text-base px-4">Start tracking your meals and nutrition by creating your first record.</p>
            <button
              onClick={handleNewRecord}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all inline-flex items-center gap-2 text-sm sm:text-base font-semibold shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Create First Record
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlanner;