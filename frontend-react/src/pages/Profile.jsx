import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
  }, [user]);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await updateProfile({ name, email });
      setMsg('Сохранено');
    } catch (e) {
      setMsg(e.response?.data?.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMsg('');
    try {
      await updateProfile({
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      });
      setCurrentPassword('');
      setPassword('');
      setPasswordConfirmation('');
      setPasswordMsg('Пароль изменён');
    } catch (e) {
      const errors = e.response?.data?.errors;
      const firstError = errors && Object.values(errors).flat()[0];
      setPasswordMsg(firstError || e.response?.data?.message || 'Ошибка смены пароля');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-md space-y-8">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Профиль</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Имя</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        {msg && <p className="text-sm text-slate-600">{msg}</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm"
        >
          {saving ? 'Сохранение…' : 'Сохранить'}
        </button>
      </form>

      <form id="change-password" onSubmit={submitPassword} className="space-y-4 border-t border-slate-200 pt-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Смена пароля</h2>
          {user?.has_temporary_password && (
            <p className="mt-1 text-sm text-indigo-700">
              Сейчас у вас временный пароль. После смены этот баннер исчезнет.
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Текущий пароль</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            autoComplete="current-password"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Новый пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Повторите новый пароль</label>
          <input
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
        {passwordMsg && <p className="text-sm text-slate-600">{passwordMsg}</p>}
        <button
          type="submit"
          disabled={passwordSaving}
          className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm"
        >
          {passwordSaving ? 'Сохранение…' : 'Сменить пароль'}
        </button>
      </form>
    </div>
  );
}
