import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'

const API_BASE_URL = "http://localhost:8000"; // Diventerà l'IP di Linux quando pubblichiamo

export default function App() {
  const [formData, setFormData] = useState({ partizione: 'test_partizione', titolo: '', contenuto: '' });
  const [documenti, setDocumenti] = useState([]);
  const [partizioneDaLeggere, setPartizioneDaLeggere] = useState('test_partizione');
  const [loading, setLoading] = useState(false);

  // 1. Funzione per caricare i dati (La nostra GET)
  const caricaDocumenti = async () => {
    if (!partizioneDaLeggere) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/partition/${partizioneDaLeggere}`);
      setDocumenti(response.data);
    } catch (error) {
      console.error("Errore nel caricamento dati:", error);
    } finally {
      setLoading(false);
    }
  };

  // Carica i dati all'avvio e ogni volta che cambia la partizione selezionata
  useEffect(() => {
    caricaDocumenti();
  }, [partizioneDaLeggere]);

  // 2. Funzione per salvare i dati (La nostra POST)
  const handleSalva = async (e) => {
    e.preventDefault();
    if (!formData.titolo || !formData.contenuto || !formData.partizione) {
      alert("Tutti i campi sono obbligatori");
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/api/salva`, formData);
      setFormData({ ...formData, titolo: '', contenuto: '' }); // reset campi di testo
      caricaDocumenti(); // Ricarica la lista dopo il salvataggio!
    } catch (error) {
      alert("Errore durante il salvataggio");
    }
  };

  return (
    <div style={styles.container}>
      <h1>AtomPulseAI - Gestione Documenti</h1>
      
      {/* SEZIONE INPUT / FORM */}
      <div style={styles.card}>
        <h3>Inserisci Nuovo Documento</h3>
        <form onSubmit={handleSalva} style={styles.form}>
          <input type="text" placeholder="Partizione (es. utente1)" value={formData.partizione} onChange={e => setFormData({...formData, partizione: e.target.value})} style={styles.input}/>
          <input type="text" placeholder="Titolo" value={formData.titolo} onChange={e => setFormData({...formData, titolo: e.target.value})} style={styles.input}/>
          <textarea placeholder="Contenuto" value={formData.contenuto} onChange={e => setFormData({...formData, contenuto: e.target.value})} style={styles.textarea}/>
          <button type="submit" style={styles.button}>Salva Nota</button>
        </form>
      </div>

      <hr style={styles.divider} />

      {/* SEZIONE FILTRO E LISTVIEW */}
      <div style={styles.card}>
        <div style={styles.filterRow}>
          <h3>ListView Partizione:</h3>
          <input type="text" value={partizioneDaLeggere} onChange={e => setPartizioneDaLeggere(e.target.value)} placeholder="Cerca partizione..." style={styles.inputFiltro} />
          <button onClick={caricaDocumenti} style={styles.buttonRefresh}>🔄 Aggiorna</button>
        </div>

        {loading ? (
          <p>Caricamento in corso...</p>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID Documento (_id)</th>
                  <th style={styles.th}>Revisione (_rev)</th>
                  <th style={styles.th}>Titolo</th>
                  <th style={styles.th}>Contenuto</th>
                  <th style={styles.th}>Tipo</th>
                </tr>
              </thead>
              <tbody>
                {documenti.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ ...styles.td, textAlign: 'center' }}>Nessun documento trovato in questa partizione.</td>
                  </tr>
                ) : (
                  documenti.map((doc) => (
                    <tr key={doc._id} style={styles.trRow}>
                      <td style={styles.tdCode}>{doc._id}</td>
                      <td style={styles.tdCode}>{doc._rev?.substring(0, 8)}...</td>
                      <td style={styles.td}><strong>{doc.titolo}</strong></td>
                      <td style={styles.td}>{doc.contenuto}</td>
                      <td style={styles.td}><span style={styles.badge}>{doc.tipo}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Stili CSS minimi in linea per incolonnare pulito
const styles = {
  container: { maxWidth: '900px', margin: '30px auto', padding: '0 20px', fontFamily: 'Segoe UI, Roboto, sans-serif' },
  card: { backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' },
  textarea: { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', minHeight: '60px' },
  button: { padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  divider: { margin: '30px 0', border: '0', borderTop: '1px solid #ccc' },
  filterRow: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' },
  inputFiltro: { padding: '8px', borderRadius: '4px', border: '1px solid #0070f3', fontSize: '14px', width: '200px' },
  buttonRefresh: { padding: '8px 12px', backgroundColor: '#eaeaea', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px', backgroundColor: 'white' },
  th: { backgroundColor: '#f1f1f1', padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', fontSize: '14px', color: '#333' },
  td: { padding: '12px', borderBottom: '1px solid #ddd', fontSize: '14px', color: '#555' },
  tdCode: { padding: '12px', borderBottom: '1px solid #ddd', fontSize: '12px', fontFamily: 'monospace', color: '#0070f3' },
  trRow: { transition: 'background 0.2s', ':hover': { backgroundColor: '#f5f5f5' } },
  badge: { backgroundColor: '#e1f5fe', color: '#0288d1', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }
};