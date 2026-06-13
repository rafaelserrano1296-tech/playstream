import React, { useEffect, useState } from 'react';
import { Users, Film, CreditCard, DollarSign } from 'lucide-react';
import { adminAPI } from '../../services/api';
import Loading from '../../components/ui/Loading';

interface Stats {
  totalUsuarios: number;
  totalFilmes: number;
  totalPagamentos: number;
  receitaTotal: number;
}

const Card = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) => (
  <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.dashboard()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card icon={Users} label="Usuários" value={String(stats?.totalUsuarios ?? 0)} color="bg-blue-600" />
        <Card icon={Film} label="Filmes/Séries" value={String(stats?.totalFilmes ?? 0)} color="bg-purple-600" />
        <Card icon={CreditCard} label="Vendas" value={String(stats?.totalPagamentos ?? 0)} color="bg-green-600" />
        <Card icon={DollarSign} label="Receita Total" value={`R$ ${Number(stats?.receitaTotal ?? 0).toFixed(2)}`} color="bg-netflix-red" />
      </div>
    </div>
  );
}
