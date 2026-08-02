import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '',
    profile: { 
      dateOfBirth: user?.profile?.dateOfBirth?.split('T')[0] || '', 
      gender: user?.profile?.gender || '', 
      height: user?.profile?.height || '', 
      weight: user?.profile?.weight || '', 
      bloodGroup: user?.profile?.bloodGroup || '', 
      address: user?.profile?.address || {}, 
      emergencyContact: user?.profile?.emergencyContact || {},
      guardian: user?.profile?.guardian || { name: '', phone: '' },
      profession: user?.profile?.profession || ''
    },
    patientInfo: { diabetesType: user?.patientInfo?.diabetesType || '', medications: user?.patientInfo?.medications || [], conditions: user?.patientInfo?.conditions || [], allergies: user?.patientInfo?.allergies || [], isPregnant: user?.patientInfo?.isPregnant || false, pregnancyWeeks: user?.patientInfo?.pregnancyWeeks || 0 },
    doctorInfo: { specialization: user?.doctorInfo?.specialization || '', licenseNumber: user?.doctorInfo?.licenseNumber || '', experience: user?.doctorInfo?.experience || '', consultationFee: user?.doctorInfo?.consultationFee || '' },
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        profile: {
          dateOfBirth: user.profile?.dateOfBirth?.split('T')[0] || '',
          gender: user.profile?.gender || '',
          height: user.profile?.height || '',
          weight: user.profile?.weight || '',
          bloodGroup: user.profile?.bloodGroup || '',
          address: user.profile?.address || {},
          emergencyContact: user.profile?.emergencyContact || {},
          guardian: user.profile?.guardian || { name: '', phone: '' },
          profession: user.profile?.profession || ''
        },
        patientInfo: {
          diabetesType: user.patientInfo?.diabetesType || '',
          medications: user.patientInfo?.medications || [],
          conditions: user.patientInfo?.conditions || [],
          allergies: user.patientInfo?.allergies || [],
          isPregnant: user.patientInfo?.isPregnant || false,
          pregnancyWeeks: user.patientInfo?.pregnancyWeeks || 0
        },
        doctorInfo: {
          specialization: user.doctorInfo?.specialization || '',
          licenseNumber: user.doctorInfo?.licenseNumber || '',
          experience: user.doctorInfo?.experience || '',
          consultationFee: user.doctorInfo?.consultationFee || ''
        }
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
    } catch {}
    setSaving(false);
  };

  const bmi = user?.bmi;
  let bmiCategory = 'N/A';
  if (bmi) { if (bmi < 18.5) bmiCategory = 'Underweight'; else if (bmi < 25) bmiCategory = 'Normal'; else if (bmi < 30) bmiCategory = 'Overweight'; else bmiCategory = 'Obese'; }

  return (
    <Layout>
      <div className="page-container max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>

        {bmi && (
          <div className="card mb-6 flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white ${bmi < 25 ? 'bg-green-500' : bmi < 30 ? 'bg-yellow-500' : 'bg-red-500'}`}>{bmi}</div>
            <div>
              <p className="font-semibold">BMI: {bmiCategory}</p>
              <p className="text-sm text-gray-500">Height: {form.profile.height}cm | Weight: {form.profile.weight}kg</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">First Name</label><input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="input-field" /></div>
              <div><label className="block text-sm font-medium mb-1">Last Name</label><input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="input-field" /></div>
              <div><label className="block text-sm font-medium mb-1">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" /></div>
              <div><label className="block text-sm font-medium mb-1">Date of Birth</label><input type="date" value={form.profile.dateOfBirth?.split('T')[0] || ''} onChange={e => setForm({ ...form, profile: { ...form.profile, dateOfBirth: e.target.value } })} className="input-field" /></div>
              <div><label className="block text-sm font-medium mb-1">Gender</label><select value={form.profile.gender} onChange={e => setForm({ ...form, profile: { ...form.profile, gender: e.target.value } })} className="input-field"><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
              <div><label className="block text-sm font-medium mb-1">Blood Group</label><input value={form.profile.bloodGroup} onChange={e => setForm({ ...form, profile: { ...form.profile, bloodGroup: e.target.value } })} className="input-field" /></div>
              <div><label className="block text-sm font-medium mb-1">Profession</label><input value={form.profile.profession || ''} onChange={e => setForm({ ...form, profile: { ...form.profile, profession: e.target.value } })} className="input-field" placeholder="e.g. Software Engineer, Teacher" /></div>
            </div>
          </div>

          {user?.role === 'patient' && (
            <>
              <div className="card">
                <h2 className="text-lg font-semibold mb-4">Body Metrics</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Height (cm)</label><input type="number" value={form.profile.height} onChange={e => setForm({ ...form, profile: { ...form.profile, height: parseFloat(e.target.value) } })} className="input-field" /></div>
                  <div><label className="block text-sm font-medium mb-1">Weight (kg)</label><input type="number" value={form.profile.weight} onChange={e => setForm({ ...form, profile: { ...form.profile, weight: parseFloat(e.target.value) } })} className="input-field" /></div>
                </div>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold mb-4">Diabetes Information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Diabetes Type</label><select value={form.patientInfo.diabetesType} onChange={e => setForm({ ...form, patientInfo: { ...form.patientInfo, diabetesType: e.target.value } })} className="input-field"><option value="">Select</option><option value="type1">Type 1</option><option value="type2">Type 2</option><option value="gestational">Gestational</option><option value="prediabetes">Prediabetes</option></select></div>
                </div>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold mb-4">Pregnancy Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="isPregnant"
                      checked={form.patientInfo.isPregnant} 
                      onChange={e => setForm({ 
                        ...form, 
                        patientInfo: { ...form.patientInfo, isPregnant: e.target.checked } 
                      })} 
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" 
                    />
                    <label htmlFor="isPregnant" className="text-sm font-medium text-gray-700">Are you currently pregnant?</label>
                  </div>
                  
                  {form.patientInfo.isPregnant && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Pregnancy Time (Weeks)</label>
                        <input 
                          type="number" 
                          min="1" 
                          max="42"
                          value={form.patientInfo.pregnancyWeeks || ''} 
                          onChange={e => setForm({ 
                            ...form, 
                            patientInfo: { ...form.patientInfo, pregnancyWeeks: parseInt(e.target.value) || 0 } 
                          })} 
                          className="input-field" 
                          placeholder="e.g. 14"
                        />
                        <p className="text-xs text-gray-500 mt-1">Entering this allows us to customize your physical activity recommendations.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold mb-4">Emergency Contact</h2>
                <div className="grid sm:grid-cols-4 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Name</label><input value={form.profile.emergencyContact?.name || ''} onChange={e => setForm({ ...form, profile: { ...form.profile, emergencyContact: { ...form.profile.emergencyContact, name: e.target.value } } })} className="input-field" /></div>
                  <div><label className="block text-sm font-medium mb-1">Phone</label><input value={form.profile.emergencyContact?.phone || ''} onChange={e => setForm({ ...form, profile: { ...form.profile, emergencyContact: { ...form.profile.emergencyContact, phone: e.target.value } } })} className="input-field" /></div>
                  <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={form.profile.emergencyContact?.email || ''} onChange={e => setForm({ ...form, profile: { ...form.profile, emergencyContact: { ...form.profile.emergencyContact, email: e.target.value } } })} className="input-field" /></div>
                  <div><label className="block text-sm font-medium mb-1">Relationship</label><input value={form.profile.emergencyContact?.relationship || ''} onChange={e => setForm({ ...form, profile: { ...form.profile, emergencyContact: { ...form.profile.emergencyContact, relationship: e.target.value } } })} className="input-field" /></div>
                </div>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold mb-4">Guardian Details</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Guardian Name</label>
                    <input 
                      value={form.profile.guardian?.name || ''} 
                      onChange={e => setForm({ 
                        ...form, 
                        profile: { 
                          ...form.profile, 
                          guardian: { ...form.profile.guardian, name: e.target.value } 
                        } 
                      })} 
                      className="input-field" 
                      placeholder="e.g. Robert Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Guardian Contact Number</label>
                    <input 
                      value={form.profile.guardian?.phone || ''} 
                      onChange={e => setForm({ 
                        ...form, 
                        profile: { 
                          ...form.profile, 
                          guardian: { ...form.profile.guardian, phone: e.target.value } 
                        } 
                      })} 
                      className="input-field" 
                      placeholder="e.g. +18885551234"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {user?.role === 'doctor' && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Professional Doctor Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Specialization</label>
                  <input 
                    value={form.doctorInfo?.specialization || ''} 
                    onChange={e => setForm({ 
                      ...form, 
                      doctorInfo: { ...form.doctorInfo, specialization: e.target.value } 
                    })} 
                    className="input-field" 
                    placeholder="e.g. Endocrinology"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">License Number</label>
                  <input 
                    value={form.doctorInfo?.licenseNumber || ''} 
                    onChange={e => setForm({ 
                      ...form, 
                      doctorInfo: { ...form.doctorInfo, licenseNumber: e.target.value } 
                    })} 
                    className="input-field" 
                    placeholder="e.g. LIC123456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Experience (Years)</label>
                  <input 
                    type="number"
                    value={form.doctorInfo?.experience || ''} 
                    onChange={e => setForm({ 
                      ...form, 
                      doctorInfo: { ...form.doctorInfo, experience: parseInt(e.target.value) || '' } 
                    })} 
                    className="input-field" 
                    placeholder="e.g. 10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Consultation Fee ($)</label>
                  <input 
                    type="number"
                    value={form.doctorInfo?.consultationFee || ''} 
                    onChange={e => setForm({ 
                      ...form, 
                      doctorInfo: { ...form.doctorInfo, consultationFee: parseFloat(e.target.value) || '' } 
                    })} 
                    className="input-field" 
                    placeholder="e.g. 100"
                  />
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>
    </Layout>
  );
}
