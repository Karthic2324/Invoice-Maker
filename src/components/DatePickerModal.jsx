import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// Simple calendar popup (pure React Native - no extra native package needed).
export default function DatePickerModal({ visible, value, onSelect, onClose }) {
  const [view, setView] = useState(new Date(value || new Date()));

  useEffect(() => {
    if (visible) setView(new Date(value || new Date()));
  }, [visible]);

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const goMonth = (delta) => setView(new Date(year, month + delta, 1));
  const today = new Date();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          <View style={s.navRow}>
            <TouchableOpacity onPress={() => goMonth(-12)} style={s.navBtn}><Text style={s.navText}>«</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => goMonth(-1)} style={s.navBtn}><Text style={s.navText}>‹</Text></TouchableOpacity>
            <Text style={s.title}>{MONTHS[month]} {year}</Text>
            <TouchableOpacity onPress={() => goMonth(1)} style={s.navBtn}><Text style={s.navText}>›</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => goMonth(12)} style={s.navBtn}><Text style={s.navText}>»</Text></TouchableOpacity>
          </View>

          <View style={s.weekRow}>
            {DAYS.map((d) => <Text key={d} style={s.weekDay}>{d}</Text>)}
          </View>

          <View style={s.grid}>
            {cells.map((c, i) => {
              const selected = c && value && sameDay(c, value);
              const isToday = c && sameDay(c, today);
              return (
                <TouchableOpacity
                  key={i}
                  disabled={!c}
                  style={[s.cell, selected && s.cellSelected, !selected && isToday && s.cellToday]}
                  onPress={() => { onSelect(c); onClose(); }}
                >
                  <Text style={[s.cellText, selected && { color: '#fff', fontWeight: 'bold' }]}>{c ? c.getDate() : ''}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={s.footer}>
            <TouchableOpacity style={s.todayBtn} onPress={() => { onSelect(new Date()); onClose(); }}>
              <Text style={s.btnText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <Text style={s.btnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  card: { backgroundColor: '#1e293b', borderRadius: 12, padding: 14, width: '100%', maxWidth: 360, borderWidth: 1, borderColor: '#334155' },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  navBtn: { paddingHorizontal: 10, paddingVertical: 4 },
  navText: { color: '#38bdf8', fontSize: 20, fontWeight: 'bold' },
  title: { color: '#fff', fontWeight: 'bold', fontSize: 14, flex: 1, textAlign: 'center' },
  weekRow: { flexDirection: 'row' },
  weekDay: { width: `${100 / 7}%`, textAlign: 'center', color: '#94a3b8', fontSize: 11, paddingVertical: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  cellSelected: { backgroundColor: '#0284c7' },
  cellToday: { borderWidth: 1, borderColor: '#38bdf8' },
  cellText: { color: '#e2e8f0', fontSize: 13 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  todayBtn: { backgroundColor: '#059669', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
  closeBtn: { backgroundColor: '#ef4444', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});
