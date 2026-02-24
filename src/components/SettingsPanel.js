import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { supabase } from '../supabaseClient';
import { EXPECTED_KEYS } from '../hooks/useSettings';

function SettingsPanel({ show, onClose, onSaved }) {
    const [authenticated, setAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    const [values, setValues] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveResult, setSaveResult] = useState(null);

    useEffect(() => {
        if (!show) {
            setAuthenticated(false);
            setPassword('');
            setAuthError('');
            setSaveResult(null);
        }
    }, [show]);

    useEffect(() => {
        if (authenticated) {
            loadCurrentValues();
        }
    }, [authenticated]);

    const handleLogin = async () => {
        setAuthLoading(true);
        setAuthError('');
        try {
            const { data, error } = await supabase
                .from('calculator_settings')
                .select('value')
                .eq('key', 'adminPassword')
                .single();

            if (error) throw error;

            if (data.value === password) {
                setAuthenticated(true);
            } else {
                setAuthError('Неверный пароль');
            }
        } catch {
            setAuthError('Ошибка проверки пароля');
        } finally {
            setAuthLoading(false);
        }
    };

    const loadCurrentValues = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('calculator_settings')
                .select('key, value');

            if (error) throw error;

            const current = {};
            for (const key of Object.keys(EXPECTED_KEYS)) {
                const row = data.find(r => r.key === key);
                current[key] = row ? row.value : '';
            }
            setValues(current);
        } catch {
            setSaveResult({ type: 'error', text: 'Ошибка загрузки настроек' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, val) => {
        setValues(prev => ({ ...prev, [key]: val }));
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveResult(null);
        try {
            const updates = Object.entries(values).map(([key, value]) =>
                supabase
                    .from('calculator_settings')
                    .update({ value: String(value) })
                    .eq('key', key)
            );

            const results = await Promise.all(updates);
            const failed = results.find(r => r.error);
            if (failed) throw failed.error;

            setSaveResult({ type: 'success', text: 'Настройки сохранены' });
            onSaved?.();
        } catch {
            setSaveResult({ type: 'error', text: 'Ошибка сохранения настроек' });
        } finally {
            setSaving(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleLogin();
    };

    return (
        <Transition appear show={show} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
                                {/* Header */}
                                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                                    <Dialog.Title className="text-lg font-semibold text-gray-800">
                                        Настройки калькулятора
                                    </Dialog.Title>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                                </div>

                                {/* Body */}
                                <div className="px-6 py-5">
                                    {!authenticated ? (
                                        <div className="max-w-sm">
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Пароль администратора
                                            </label>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder="Введите пароль"
                                                autoFocus
                                                className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                            />
                                            {authError && (
                                                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                                    {authError}
                                                </div>
                                            )}
                                            <button
                                                onClick={handleLogin}
                                                disabled={authLoading || !password}
                                                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
                                            >
                                                {authLoading ? (
                                                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                ) : 'Войти'}
                                            </button>
                                        </div>
                                    ) : loading ? (
                                        <div className="flex justify-center py-8">
                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                                        </div>
                                    ) : (
                                        <div>
                                            {saveResult && (
                                                <div className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
                                                    saveResult.type === 'success'
                                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                        : 'border-red-200 bg-red-50 text-red-700'
                                                }`}>
                                                    {saveResult.text}
                                                </div>
                                            )}
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-gray-200">
                                                        <th className="py-2 pr-4 text-left font-medium text-gray-600 w-2/5">Параметр</th>
                                                        <th className="py-2 text-left font-medium text-gray-600">Значение</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.entries(EXPECTED_KEYS).map(([key, { label }]) => (
                                                        <tr key={key} className="border-b border-gray-100">
                                                            <td className="py-2 pr-4 text-gray-700">{label}</td>
                                                            <td className="py-2">
                                                                <input
                                                                    type="text"
                                                                    value={values[key] ?? ''}
                                                                    onChange={e => handleChange(key, e.target.value)}
                                                                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                {authenticated && !loading && (
                                    <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
                                        <button
                                            onClick={onClose}
                                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
                                        >
                                            Закрыть
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
                                        >
                                            {saving ? (
                                                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            ) : 'Сохранить'}
                                        </button>
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

export default SettingsPanel;
