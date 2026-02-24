import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner, Table } from 'react-bootstrap';
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
            setSaveResult({ type: 'danger', text: 'Ошибка загрузки настроек' });
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
            setSaveResult({ type: 'danger', text: 'Ошибка сохранения настроек' });
        } finally {
            setSaving(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleLogin();
    };

    return (
        <Modal show={show} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Настройки калькулятора</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {!authenticated ? (
                    <div>
                        <Form.Group className="mb-3">
                            <Form.Label>Пароль администратора</Form.Label>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Введите пароль"
                                autoFocus
                            />
                        </Form.Group>
                        {authError && <Alert variant="danger" className="py-2">{authError}</Alert>}
                        <Button onClick={handleLogin} disabled={authLoading || !password}>
                            {authLoading ? <Spinner size="sm" animation="border" /> : 'Войти'}
                        </Button>
                    </div>
                ) : loading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" />
                    </div>
                ) : (
                    <div>
                        {saveResult && (
                            <Alert variant={saveResult.type} className="py-2">
                                {saveResult.text}
                            </Alert>
                        )}
                        <Table bordered hover size="sm">
                            <thead>
                                <tr>
                                    <th style={{ width: '40%' }}>Параметр</th>
                                    <th>Значение</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(EXPECTED_KEYS).map(([key, { label }]) => (
                                    <tr key={key}>
                                        <td className="align-middle">{label}</td>
                                        <td>
                                            <Form.Control
                                                size="sm"
                                                type="text"
                                                value={values[key] ?? ''}
                                                onChange={e => handleChange(key, e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </Modal.Body>
            {authenticated && !loading && (
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>Закрыть</Button>
                    <Button variant="primary" onClick={handleSave} disabled={saving}>
                        {saving ? <Spinner size="sm" animation="border" /> : 'Сохранить'}
                    </Button>
                </Modal.Footer>
            )}
        </Modal>
    );
}

export default SettingsPanel;
