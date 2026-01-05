import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// Configuração da API
const API_URL = 'http://localhost:8080/api/dashboard/stats';

// Cores do tema
const COLORS = {
  win: '#538d4e',   // Verde Wordle
  loss: '#e55039',  // Vermelho
  bar: '#8884d8',   // Roxo genérico
  bg: '#3a3a3c',    // Fundo Card
  text: '#ffffff',
  axis: '#dddddd'
};

// Formata segundos em mm:ss
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
};

// --- FUNÇÃO MÁGICA: Preenche dados faltantes ---
// Isso resolve o problema do eixo "picado". Garante que sempre tenha 1 a 6.
const fillData = (rawData: any[], max: number = 6) => {
  // Cria um mapa com o que veio do banco (Ex: {3: 10, 5: 2})
  const map = new Map();
  if (rawData) {
    rawData.forEach((item: any) => map.set(item[0], item[1]));
  }

  // Gera o array completo [1, 2, 3, 4, 5, 6] preenchendo com 0 se não existir
  const filled = [];
  for (let i = 1; i <= max; i++) {
    filled.push({
      label: `${i}ª`, // Legenda curta para o eixo X
      fullLabel: `${i} Tentativa(s)`,
      value: map.get(i) || 0 // Se não tiver no banco, põe 0
    });
  }
  return filled;
};

const Dashboard = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    axios.get(API_URL)
      .then(res => setData(res.data))
      .catch(err => console.error("Erro ao buscar dados:", err));
  }, []);

  if (!data) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Carregando inteligência de dados...</div>;

  // --- PREPARAÇÃO DOS DADOS ---
  
  // 1. Dados Normalizados (1 a 6 fixo)
  const winsData = fillData(data.attemptsWins);
  const lossesData = fillData(data.attemptsLosses);

  // 2. Pizza
  const winLossData = (data.winLossRatio || []).map((item: any) => ({
    name: item[0] ? 'Vitórias' : 'Derrotas',
    value: item[1]
  }));

  // 3. Linguística (Palavras)
  const openingWordsData = (data.topOpeningWords || []).map((item: any) => ({
    word: item[0],
    count: item[1]
  }));

  const hardestWordsData = (data.hardestWords || []).map((item: any) => ({
    word: item[0],
    losses: item[1]
  }));

  return (
    <div className="dashboard-container" style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto', color: 'white' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '1px solid #555', paddingBottom: '10px' }}>
        Painel de Decisão Estratégica (SAD)
      </h2>

      {/* --- KPI CARDS --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <KpiCard title="Tempo Médio" value={formatTime(data.avgTime)} color="#00C49F" />
        <KpiCard title="Tempo Mínimo" value={formatTime(data.minTime)} color="#FFBB28" />
        <KpiCard title="Tempo Máximo" value={formatTime(data.maxTime)} color="#FF8042" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        
        {/* GRÁFICO 1: Vitórias */}
        <ChartCard title="Vitórias por tentativa" desc="Pico médio">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={winsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
              <XAxis dataKey="label" stroke={COLORS.axis} />
              <YAxis allowDecimals={false} stroke={COLORS.axis} />
              <Tooltip 
                cursor={{fill: '#444'}} 
                contentStyle={{ backgroundColor: '#222', border: '1px solid #555' }}
                formatter={(value: number | undefined) => [value ?? 0, 'Jogadores']}
                labelFormatter={(label) => `${label} Tentativa`}
              />
              <Bar dataKey="value" fill={COLORS.win} radius={[4, 4, 0, 0]} name="Jogadores" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        

        {/* GRÁFICO 3: Palavras de Abertura */}
        <ChartCard title="Top 5 Aberturas" desc="Estratégias mais comuns dos usuários.">
           <ResponsiveContainer width="100%" height={250}>
            <BarChart layout="vertical" data={openingWordsData} margin={{ left: 0, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" horizontal={false} />
              <XAxis type="number" stroke={COLORS.axis} hide />
              <YAxis dataKey="word" type="category" stroke={COLORS.axis} width={70} tick={{fontSize: 12}} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#222', border: 'none' }} />
              <Bar dataKey="count" fill="#8884d8" barSize={20} radius={[0, 4, 4, 0]} name="Uso">
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* GRÁFICO 4: Palavras Difíceis */}
        <ChartCard title="Palavras Mortais" desc="Palavras que mais geram derrotas.">
           <ResponsiveContainer width="100%" height={250}>
            <BarChart layout="vertical" data={hardestWordsData} margin={{ left: 0, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" horizontal={false} />
              <XAxis type="number" stroke={COLORS.axis} hide />
              <YAxis dataKey="word" type="category" stroke={COLORS.axis} width={70} tick={{fontSize: 12}} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#222', border: 'none' }} />
              <Bar dataKey="losses" fill={COLORS.loss} barSize={20} radius={[0, 4, 4, 0]} name="Derrotas" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

         {/* GRÁFICO 5: Pizza Global */}
         <div style={{ gridColumn: 'span 2' }}>
            <ChartCard title="Taxa Global de Sucesso" desc="Visão macro do balanceamento do jogo.">
                <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie 
                        data={winLossData} 
                        cx="50%" cy="50%" 
                        innerRadius={80} 
                        outerRadius={120} 
                        dataKey="value" 
                        paddingAngle={2}
                    >
                        {winLossData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'Vitórias' ? COLORS.win : COLORS.loss} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none' }} />
                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle"/>
                    </PieChart>
                </ResponsiveContainer>
                </div>
            </ChartCard>
        </div>

      </div>
    </div>
  );
};

// Componentes auxiliares para limpar o código
const KpiCard = ({ title, value, color }: { title: string, value: string, color: string }) => (
  <div style={{ background: COLORS.bg, padding: '20px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
    <h4 style={{ margin: '0 0 10px 0', color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</h4>
    <span style={{ fontSize: '2.2rem', fontWeight: 'bold', color: color }}>{value}</span>
  </div>
);

const ChartCard = ({ title, desc, children }: { title: string, desc: string, children: React.ReactNode }) => (
  <div style={{ background: COLORS.bg, padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
    <div style={{marginBottom: '15px'}}>
        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{title}</h3>
        <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#888' }}>{desc}</p>
    </div>
    {children}
  </div>
);

export default Dashboard;