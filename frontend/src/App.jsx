import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = "http://localhost:8000"; // Linux IP when published

export default function App() {
  const [formData, setFormData] = useState({ partition: '', description: '', clientCode: '', code: '', category: '' });
  const [documents, setDocuments] = useState([]);
  const [partition, setPartition] = useState('test_partizione');
  const [loading, setLoading] = useState(false);

  // 1. Fetch documents from backend (GET request)
  const fetchDocuments = async () => {
    if (!partition) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/partition/${partition}`);
      setDocuments(response.data);
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on startup and whenever the selected partition changes
  useEffect(() => {
    fetchDocuments();
  }, [partition]);

  // 2. Save new document to backend (POST request)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.code || !formData.partition) {
      alert("Partition, Description, and Code fields are required");
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/api/salva`, formData);
      // Reset form text fields, preserving the current partition if needed
      setFormData({ partition: formData.partition, description: '', clientCode: '', code: '', category: '' }); 
      fetchDocuments(); // Reload list after saving
    } catch (error) {
      alert("Error during document preservation");
    }
  };

  return (
    <div style={styles.container}>
      <h1>AtomPulseAI - Document Management</h1>
      
      {/* INPUT SECTION / FORM */}
      <div style={styles.card}>
        <h3>Insert New Document</h3>
        <form onSubmit={handleSave} style={styles.form}>
          <input type="text" placeholder="Partition (e.g. user1)" value={formData.partition} onChange={e => setFormData({...formData, partition: e.target.value})} style={styles.input}/>
          <input type="text" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={styles.input}/>
          <input type="text" placeholder="Client Code" value={formData.clientCode} onChange={e => setFormData({...formData, clientCode: e.target.value})} style={styles.input}/>
          <input type="text" placeholder="Code" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} style={styles.input}/>
          <input type="text" placeholder="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={styles.input}/>
          <button type="submit" style={styles.button}>Save Product</button>
        </form>
      </div>

      <hr style={styles.divider} />

      {/* FILTER & LISTVIEW SECTION */}
      <div style={styles.card}>
        <div style={styles.filterRow}>
          <h3>Client / Partition:</h3>
          <input type="text" value={partition} onChange={e => setPartition(e.target.value)} placeholder="Search partition..." style={styles.inputFiltro} />
          <button onClick={fetchDocuments} style={styles.buttonRefresh}>🔄 Refresh</button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Client Code</th>
                  <th style={styles.th}>Code</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Last Update</th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ ...styles.td, textAlign: 'center' }}>
                      No documents found for this partition.
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc._id} style={styles.trRow}>
                      <td style={styles.tdCode}>{doc.description || 'N/A'}</td>
                      <td style={styles.td}>{doc.client_code || 'N/A'}</td>
                      <td style={styles.td}>{doc.code || 'Empty'}</td>
                      <td style={styles.td}>
                        <span style={styles.badge}>{doc.category || 'Generic'}</span>
                      </td>
                      <td style={styles.td}>
                        {doc.last_update ? doc.last_update.replace('T', ' ') : 'N/A'}
                      </td>
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

// Inline CSS Styles
const styles = {
  container: { maxWidth: '960px', margin: '30px auto', padding: '0 20px', fontFamily: 'Segoe UI, Roboto, sans-serif' },
  card: { backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' },
  button: { padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  divider: { margin: '30px 0', border: '0', borderTop: '1px solid #ccc' },
  filterRow: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' },
  inputFiltro: { padding: '8px', borderRadius: '4px', border: '1px solid #0070f3', fontSize: '14px', width: '200px' },
  buttonRefresh: { padding: '8px 12px', backgroundColor: '#eaeaea', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px', backgroundColor: 'white' },
  th: { backgroundColor: '#f1f1f1', padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', fontSize: '14px', color: '#333' },
  td: { padding: '12px', borderBottom: '1px solid #ddd', fontSize: '14px', color: '#555', textAlign: 'left' },
  tdCode: { padding: '12px', borderBottom: '1px solid #ddd', fontSize: '12px', color: '#555', fontWeight: 'bold', textAlign: 'left' },
  trRow: { transition: 'background 0.2s', ':hover': { backgroundColor: '#f5f5f5' } },
  badge: { backgroundColor: '#e1f5fe', color: '#0288d1', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block' }
};