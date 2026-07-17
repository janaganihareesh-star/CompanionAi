import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import {
  fetchGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  breakdownGoal
} from '../store/goalSlice';
import {
  Target,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';
import toast from 'react-hot-toast';

export default function GoalsPage() {
  const user = useSelector((state) => state.auth.user);
  const userName = user ? user.fullName.split(' ')[0] : 'Friend';
  const dispatch = useDispatch();
  const { activeGoals, completedGoals, isLoading, error } = useSelector((state) => state.goal);

  // State controls
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed'
  const [showAddModal, setShowAddModal] = useState(false);
  const [breakingDownId, setBreakingDownId] = useState(null);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('personal');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newSteps, setNewSteps] = useState(['']); // Start with one empty step input

  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  const handleAddStepField = () => {
    setNewSteps([...newSteps, '']);
  };

  const handleRemoveStepField = (index) => {
    const updated = newSteps.filter((_, i) => i !== index);
    setNewSteps(updated.length > 0 ? updated : ['']);
  };

  const handleStepValueChange = (index, value) => {
    const updated = [...newSteps];
    updated[index] = value;
    setNewSteps(updated);
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error(`Goal title is required, ${userName}!`);
      return;
    }

    // Filter out empty steps
    const stepsData = newSteps
      .filter((s) => s.trim() !== '')
      .map((s) => ({ step: s, done: false }));

    const goalPayload = {
      title: newTitle,
      description: newDesc,
      category: newCategory,
      targetDate: newTargetDate || undefined,
      steps: stepsData
    };

    try {
      await dispatch(createGoal(goalPayload)).unwrap();
      toast.success('New goal locked in! Let\'s crush it. 🎯');
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      toast.error(err || 'Failed to create goal.');
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewDesc('');
    setNewCategory('personal');
    setNewTargetDate('');
    setNewSteps(['']);
  };

  const handleToggleStep = async (goal, stepIndex) => {
    // Clone and toggle
    const updatedSteps = goal.steps.map((step, idx) => {
      if (idx === stepIndex) {
        return { ...step, done: !step.done };
      }
      return step;
    });

    const doneCount = updatedSteps.filter((s) => s.done).length;
    const computedProgress = Math.round((doneCount / updatedSteps.length) * 100);
    const willBeCompleted = computedProgress === 100;

    try {
      await dispatch(
        updateGoal({
          id: goal._id,
          data: {
            steps: updatedSteps,
            isCompleted: willBeCompleted
          }
        })
      ).unwrap();
      
      if (willBeCompleted && !goal.isCompleted) {
        toast.success(`🎉 Achievement unlocked! You finished: ${goal.title}`);
        dispatch(fetchGoals()); // Refresh tab lists
      }
    } catch (err) {
      toast.error('Failed to update step checklist.');
    }
  };

  const handleToggleGoalCompletion = async (goal) => {
    const isNowCompleted = !goal.isCompleted;
    try {
      await dispatch(
        updateGoal({
          id: goal._id,
          data: {
            isCompleted: isNowCompleted,
            progress: isNowCompleted ? 100 : 0
          }
        })
      ).unwrap();
      toast.success(isNowCompleted ? 'Goal achieved! Amazing work! 🏆' : 'Goal moved back to active.');
      dispatch(fetchGoals());
    } catch (err) {
      toast.error('Failed to update goal completion.');
    }
  };

  const handleAiBreakdown = async (goalId) => {
    setBreakingDownId(goalId);
    try {
      await dispatch(breakdownGoal(goalId)).unwrap();
      toast.success('AI Breakdown finished! Checklist updated. ✨');
    } catch (err) {
      toast.error(err || 'Gemini AI breakdown failed.');
    } finally {
      setBreakingDownId(null);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await dispatch(deleteGoal(id)).unwrap();
        toast.success('Goal deleted.');
      } catch (err) {
        toast.error('Failed to delete goal.');
      }
    }
  };

  const categories = [
    { value: 'personal', label: 'Personal' },
    { value: 'career', label: 'Career' },
    { value: 'health', label: 'Health' },
    { value: 'learning', label: 'Learning' },
    { value: 'finance', label: 'Finance' }
  ];

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'career': return 'text-cyan bg-cyan/10 border-cyan/20';
      case 'health': return 'text-rose bg-rose/10 border-rose/20';
      case 'learning': return 'text-amber bg-amber/10 border-amber/20';
      case 'finance': return 'text-emerald bg-emerald/10 border-emerald/20';
      default: return 'text-accent bg-accent/10 border-accent/20';
    }
  };

  const currentGoals = activeTab === 'active' ? activeGoals : completedGoals;

  return (
    <div className="flex min-h-screen bg-bg text-text">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold font-outfit text-text flex items-center gap-2">
              <Target className="w-8 h-8 text-accent animate-pulse" /> Goal Tracker
            </h2>
            <p className="text-muted text-sm mt-0.5">Plan, organize, and crush your short-term and long-term milestones, ${userName}.</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 bg-accent text-white font-bold rounded-xl flex items-center gap-2 hover:opacity-90 transition shadow-card cursor-pointer text-sm"
          >
            <Plus className="w-4 h-4" /> Add Goal
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 p-1 bg-surface border border-border rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
              activeTab === 'active' ? 'bg-panel text-accent shadow-sm' : 'text-muted hover:text-text'
            }`}
          >
            Active ({activeGoals?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
              activeTab === 'completed' ? 'bg-panel text-accent shadow-sm' : 'text-muted hover:text-text'
            }`}
          >
            Completed ({completedGoals?.length || 0})
          </button>
        </div>

        {/* Goals List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading && !breakingDownId ? (
            <div className="col-span-full py-12">
              <SkeletonLoader lines={6} />
            </div>
          ) : currentGoals && currentGoals.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {currentGoals.map((goal) => (
                <motion.div
                  key={goal._id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-6 rounded-2xl bg-surface border border-border hover:border-accent/40 shadow-card flex flex-col justify-between relative group"
                >
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold capitalize ${getCategoryColor(goal.category)}`}>
                          {goal.category}
                        </span>
                        <h3 className={`text-xl font-bold font-outfit text-text ${goal.isCompleted ? 'line-through text-muted' : ''}`}>
                          {goal.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleDeleteGoal(goal._id)}
                        className="p-2 text-muted hover:text-rose hover:bg-rose/10 rounded-lg transition opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {goal.description && (
                      <p className="text-muted text-xs leading-relaxed">{goal.description}</p>
                    )}

                    {/* Progress details */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-muted">Target Progress</span>
                        <span className="text-accent">{goal.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-panel rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-accent to-cyan rounded-full transition-all duration-500"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Steps Checklists */}
                    {goal.steps && goal.steps.length > 0 ? (
                      <div className="space-y-2.5 border-t border-border/40 pt-4">
                        <h4 className="text-xs font-bold text-text flex items-center gap-1.5">
                          <ListTodo className="w-4 h-4 text-accent" /> Tasks Checklist
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {goal.steps.map((step, idx) => (
                            <label
                              key={idx}
                              className={`flex items-start gap-2.5 p-2 rounded-lg border border-border/40 hover:bg-panel cursor-pointer transition text-xs ${
                                step.done ? 'text-muted' : 'text-text'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={step.done}
                                disabled={goal.isCompleted}
                                onChange={() => handleToggleStep(goal, idx)}
                                className="w-4 h-4 rounded border-border text-accent focus:ring-accent accent-accent mt-0.5 cursor-pointer"
                              />
                              <span className={step.done ? 'line-through text-muted' : ''}>
                                {step.step}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : (
                      !goal.isCompleted && (
                        <div className="p-4 bg-panel rounded-xl text-center space-y-3 border border-dashed border-border">
                          <p className="text-muted text-[11px]">No check steps yet. Break it down using Gemini AI!</p>
                          <button
                            onClick={() => handleAiBreakdown(goal._id)}
                            disabled={breakingDownId === goal._id}
                            className="px-4 py-2 bg-accent/10 border border-accent/20 text-accent text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 hover:bg-accent/20 transition cursor-pointer mx-auto"
                          >
                            {breakingDownId === goal._id ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Breaking down...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" /> AI Breakdown Steps
                              </>
                            )}
                          </button>
                        </div>
                      )
                    )}
                  </div>

                  {/* Card footer options */}
                  <div className="flex justify-between items-center border-t border-border/40 mt-5 pt-4">
                    <div className="flex items-center gap-1 text-[11px] text-muted font-semibold">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {goal.targetDate 
                          ? new Date(goal.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'No limit'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {goal.steps && goal.steps.length > 0 && !goal.isCompleted && (
                        <button
                          onClick={() => handleAiBreakdown(goal._id)}
                          disabled={breakingDownId === goal._id}
                          className="px-2.5 py-1.5 bg-panel text-muted hover:text-accent border border-border hover:border-accent/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                          title="Regenerate Steps"
                        >
                          {breakingDownId === goal._id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3 text-accent" />
                          )}
                          <span>AI Breakdown</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleToggleGoalCompletion(goal)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition ${
                          goal.isCompleted
                            ? 'bg-emerald/10 text-emerald border border-emerald/20 hover:bg-emerald/20'
                            : 'bg-panel text-text border border-border hover:border-accent/40'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{goal.isCompleted ? 'Completed' : 'Complete'}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="col-span-full py-16 text-center bg-surface border border-dashed border-border rounded-2xl flex flex-col items-center justify-center space-y-3">
              <AlertCircle className="w-10 h-10 text-muted" />
              <div className="space-y-1">
                <h3 className="font-bold text-text">No Goals Found</h3>
                <p className="text-muted text-xs max-w-xs mx-auto">
                  {activeTab === 'active' 
                    ? 'Every massive achievement starts with a simple step. Create your first companion goal!'
                    : 'You haven\'t completed any goals yet. Check off all steps of an active goal to complete it!'}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ADD MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-card overflow-hidden"
            >
              <div className="flex justify-between items-center p-5 border-b border-border/40">
                <h3 className="text-lg font-bold font-outfit text-text flex items-center gap-1.5">
                  <Target className="w-5 h-5 text-accent" /> Lock in a New Goal
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 text-muted hover:text-text rounded-lg hover:bg-panel transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGoal} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted">Goal Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Complete DSA coding course"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-panel border border-border rounded-xl text-sm focus:border-accent outline-none text-text"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted">Description</label>
                  <textarea
                    placeholder={`Describe what achieving this goal will bring to your life, ${userName}...`}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full px-4 py-3 bg-panel border border-border rounded-xl text-sm focus:border-accent outline-none min-h-[80px] text-text"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-panel border border-border rounded-xl text-sm focus:border-accent outline-none text-text cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.value} value={c.value} className="bg-surface text-text">
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted">Target Date</label>
                    <input
                      type="date"
                      value={newTargetDate}
                      onChange={(e) => setNewTargetDate(e.target.value)}
                      className="w-full px-4 py-3 bg-panel border border-border rounded-xl text-sm focus:border-accent outline-none text-text cursor-pointer"
                    />
                  </div>
                </div>

                {/* Steps sub-form */}
                <div className="space-y-2 border-t border-border/40 pt-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-muted flex items-center gap-1">
                      <ListTodo className="w-3.5 h-3.5" /> Action Steps Checklist
                    </label>
                    <button
                      type="button"
                      onClick={handleAddStepField}
                      className="text-xs text-accent font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Step
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {newSteps.map((step, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          placeholder={`Step ${idx + 1}`}
                          value={step}
                          onChange={(e) => handleStepValueChange(idx, e.target.value)}
                          className="flex-1 px-3 py-2 bg-panel border border-border rounded-lg text-xs focus:border-accent outline-none text-text"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveStepField(idx)}
                          className="p-2 text-muted hover:text-rose hover:bg-rose/10 rounded-lg transition cursor-pointer"
                          title="Remove Step"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted">
                    💡 You can also leave these blank and ask Gemini AI to break down steps automatically later!
                  </p>
                </div>

                <div className="flex justify-end gap-3 border-t border-border/40 pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); resetForm(); }}
                    className="px-5 py-3 border border-border text-muted font-bold rounded-xl text-sm hover:bg-panel transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-3 bg-accent text-white font-bold rounded-xl text-sm hover:opacity-90 transition cursor-pointer"
                  >
                    Confirm Goal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
