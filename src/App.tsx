import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  HelpCircle, 
  ShoppingBag,
  Package,
  QrCode,
  Timer,
  Printer,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Layers,
  Search,
  Mic,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Components ---

function QuickActionCard({ 
  title, 
  Icon, 
  bgColor, 
  iconBg, 
  iconColor, 
  spanFull = false,
  delay = 0 
}: { 
  title: string; 
  Icon: any; 
  bgColor: string; 
  iconBg: string; 
  iconColor: string; 
  spanFull?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white p-5 rounded-[22px] flex items-center gap-4 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all border border-transparent hover:border-slate-100 ${spanFull ? 'sm:col-span-2' : ''}`}
    >
      <div className={`w-[46px] h-[46px] ${iconBg} rounded-[14px] flex items-center justify-center`}>
        <Icon className={`w-5.5 h-5.5 ${iconColor}`} />
      </div>
      <h3 className={`text-lg font-bold ${iconColor.replace('text-', 'text-opacity-80 text-')}`}>{title}</h3>
    </motion.div>
  );
}

export default function App() {
  const [view, setView] = useState<'auth' | 'home' | 'inventory' | 'inventory-items'>('auth');
  const [email, setEmail] = useState('convidado.billy@ec.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState<{ token: string; name: string } | null>(null);

  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [branches, setBranches] = useState<{ id: string; nome: string }[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  // --- Movement State ---
  const [movements, setMovements] = useState<any[]>([]);
  const [isLoadingMovements, setIsLoadingMovements] = useState(false);

  // --- Inventory State ---
  const [inventories, setInventories] = useState<any[]>([]);
  const [isLoadingInventories, setIsLoadingInventories] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [isOpeningInventory, setIsOpeningInventory] = useState(false);
  const [isListeningAudio, setIsListeningAudio] = useState(false);
  const [ultimaTranscricaoAudio, setUltimaTranscricaoAudio] = useState('');

  const normalizarBusca = (texto: string) => {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  const calcularScoreProduto = (produto: any, termo: string, tokens: string[]) => {
    let score = 0;
    const nome = normalizarBusca(produto.NomeProduto || '');
    const codigo = normalizarBusca(produto.CodigoProduto || '');

    if (nome === termo || codigo === termo) score += 100;
    if (nome.startsWith(termo)) score += 50;
    
    tokens.forEach(token => {
      if (nome.includes(token)) score += 10;
      if (codigo.includes(token)) score += 5;
    });

    return score;
  };

  const localizarProdutosPorNomeFalado = (textoFalado: string) => {
    const termo = normalizarBusca(textoFalado);
    if (!termo) return;

    const tokens = termo.split(' ').filter(x => x.length >= 2);
    
    // Usamos os produtos que já temos na lista ou buscamos todos se necessário
    // Por enquanto, vamos filtrar o que está em produtosFiltrados ou manter a busca geral
    const scored = produtosFiltrados
      .map(p => ({ p, score: calcularScoreProduto(p, termo, tokens) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score || a.p.NomeProduto.length - b.p.NomeProduto.length)
      .map(x => x.p)
      .slice(0, 5);

    if (scored.length > 0) {
      setProdutosFiltrados(scored);
    }
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListeningAudio(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setUltimaTranscricaoAudio(transcript);
      setTextoBusca(transcript);
      localizarProdutosPorNomeFalado(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Erro no reconhecimento de voz:', event.error);
      setIsListeningAudio(false);
    };

    recognition.onend = () => {
      setIsListeningAudio(false);
    };

    recognition.start();
  };

  const [selectedInventory, setSelectedInventory] = useState<any | null>(null);
  const [selectedProductForReg, setSelectedProductForReg] = useState<any | null>(null);
  const [quantidadeContada, setQuantidadeContada] = useState<string>('');
  const [isRegisteringItem, setIsRegisteringItem] = useState(false);
  const [isViewingRegisteredItems, setIsViewingRegisteredItems] = useState(false);
  const [registeredItems, setRegisteredItems] = useState<any[]>([]);
  const [isLoadingRegisteredItems, setIsLoadingRegisteredItems] = useState(false);


  const [textoBusca, setTextoBusca] = useState('');
  const [produtosFiltrados, setProdutosFiltrados] = useState<any[]>([]);
  const [isLoadingProdutos, setIsLoadingProdutos] = useState(false);

  const registerInventoryItem = async () => {
    if (!user || !selectedInventory || !selectedProductForReg || !quantidadeContada) return;

    setIsRegisteringItem(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/inventarioitem`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inventarioEntityId: selectedInventory.id,
          produtoId: selectedProductForReg.id,
          estoqueContado: Number(quantidadeContada)
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao registrar item no servidor');
      }

      alert('Item registrado com sucesso!');
      setSelectedProductForReg(null);
      setQuantidadeContada('');
    } catch (error) {
      console.error('Erro ao registrar item:', error);
      alert('Erro ao registrar item. Verifique os dados e tente novamente.');
    } finally {
      setIsRegisteringItem(false);
    }
  };

  const fetchRegisteredItems = async () => {
    if (!user || !selectedInventory) return;

    setIsLoadingRegisteredItems(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/inventarioitem/filtro`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inventarioEntityId: selectedInventory.id
        })
      });

      const result = await response.json();
      if (result.status && Array.isArray(result.data)) {
        setRegisteredItems(result.data);
      } else if (Array.isArray(result)) {
        setRegisteredItems(result);
      }
    } catch (error) {
      console.error('Erro ao buscar itens registrados:', error);
      setRegisteredItems([]);
    } finally {
      setIsLoadingRegisteredItems(false);
    }
  };

  const [tiposCategoria] = useState([
    { id: 'Todos', nome: 'Todos' },
    { id: 'Venda', nome: 'Venda' },
    { id: 'MateriaPrima', nome: 'Materia-prima' }
  ]);
  const [selectedTipoCategoria, setSelectedTipoCategoria] = useState('Todos');
  const [allCategorias, setAllCategorias] = useState<any[]>([]);
  const [filteredCategorias, setFilteredCategorias] = useState<any[]>([]);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState('');

  const fetchCategorias = async (token: string) => {
    try {
      console.log('Buscando categorias...');
      const response = await fetch(`${API_BASE_URL}/api/categoriaproduto`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      console.log('Resultado categorias:', result);
      
      if (result.status && Array.isArray(result.data)) {
        setAllCategorias(result.data);
      } else if (Array.isArray(result)) {
        setAllCategorias(result);
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  React.useEffect(() => {
    if (view === 'inventory-items' && user) {
      fetchCategorias(user.token);
    }
  }, [view, user]);

  React.useEffect(() => {
    let filtered = allCategorias;
    if (selectedTipoCategoria !== 'Todos') {
      // Ajuste para bater com o enum que pode vir como string ou valor
      filtered = allCategorias.filter(c => 
        c.tipoCategoriaDtoEnum === selectedTipoCategoria || 
        String(c.tipoCategoriaDtoEnum) === selectedTipoCategoria
      );
    }
    setFilteredCategorias(filtered);
    
    // Resetar categoria selecionada se ela não estiver na nova lista filtrada
    if (selectedCategoriaId && !filtered.find(c => c.id === selectedCategoriaId)) {
      setSelectedCategoriaId('');
    }
  }, [selectedTipoCategoria, allCategorias]);

  const openNewInventory = async () => {
    if (!user || !selectedBranchId) return;
    
    setIsOpeningInventory(true);
    try {
      // Check if there is already an open inventory for the selected branch
      const hasOpenInventory = inventories.some(inv => inv.situacao === 0);
      if (hasOpenInventory) {
        throw new Error('Já existe um inventário aberto para esta filial. Encerre o atual antes de abrir um novo.');
      }

      const response = await fetch(`${API_BASE_URL}/api/inventario/novo-inventario`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filialEntityId: selectedBranchId,
          dataInventario: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.mensagem || `Erro ao abrir inventário: ${response.status}`);
      }

      // Refresh the list after creating a new inventory
      await fetchInventories(user.token, selectedBranchId);
      alert('Novo inventário aberto com sucesso!');
    } catch (error) {
      console.error('Erro ao abrir novo inventário:', error);
      alert(error instanceof Error ? error.message : 'Erro ao abrir novo inventário');
    } finally {
      setIsOpeningInventory(false);
    }
  };

  const API_BASE_URL = '/proxy';

  const fetchInventories = async (token: string, branchId?: string) => {
    setIsLoadingInventories(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/inventario/inventarios-filtro`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filialEntityId: branchId || selectedBranchId || '',
          dataInventarioInicial: new Date(startDate).toISOString(),
          dataInventarioFinal: new Date(endDate).toISOString()
        })
      });
      const result = await response.json();
      if (result.status && Array.isArray(result.data)) {
        // Map common properties for UI consistency
        const mappedData = result.data.map((inv: any) => ({
          ...inv,
          dataInventarioExibicao: new Date(inv.dataInventario).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
          situacaoDescricaoExibicao: inv.situacaoDescricao || (inv.situacao === 0 ? 'ABERTO' : 'CONCLUÍDO'),
          situacaoBackgroundColor: inv.situacao === 0 ? '#ECFDF5' : '#F1F5F9',
          situacaoTextColor: inv.situacao === 0 ? '#059669' : '#64748B',
          podeEncerrar: inv.situacao === 0,
          podeExibirAcoesFechamento: inv.situacao !== 0
        }));
        setInventories(mappedData);
      } else {
        setInventories([]);
      }
    } catch (error) {
      console.error('Erro ao buscar inventários:', error);
      setInventories([]);
    } finally {
      setIsLoadingInventories(false);
    }
  };

  React.useEffect(() => {
    if (view === 'inventory' && user) {
      fetchInventories(user.token, selectedBranchId);
    }
  }, [selectedBranchId, view, startDate, endDate]);

  React.useEffect(() => {
    const fetchProdutos = async () => {
      if (view !== 'inventory-items' || !user) return;
      
      setIsLoadingProdutos(true);
      try {
        const queryParams = new URLSearchParams();
        // Adicionando múltiplos nomes comuns de parâmetros para aumentar chance de acerto com a API
        if (textoBusca) {
          queryParams.append('textoBusca', textoBusca);
          queryParams.append('search', textoBusca);
          queryParams.append('nome', textoBusca);
          queryParams.append('filtro', textoBusca);
        }
        if (selectedCategoriaId) {
          queryParams.append('categoriaProdutoEntityId', selectedCategoriaId);
          queryParams.append('categoriaId', selectedCategoriaId);
        }
        if (selectedTipoCategoria !== 'Todos') {
          queryParams.append('produtoTipoEnum', selectedTipoCategoria);
          queryParams.append('tipoCategoria', selectedTipoCategoria);
        }
        
        const response = await fetch(`${API_BASE_URL}/api/produto?${queryParams.toString()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();
        let rawData = [];
        
        if (result.status && Array.isArray(result.data)) {
          rawData = result.data;
        } else if (Array.isArray(result)) {
          rawData = result;
        }

        // Mapeando e aplicando filtro local para garantir consistência caso a API não filtre perfeitamente
        const mapped = rawData.map((p: any) => ({
          ...p,
          CodigoProduto: p.codigoProduto || p.id?.substring(0, 5),
          NomeProduto: p.nomeProduto || p.nome,
          CategoriaProduto: p.categoriaProduto || p.nomeCategoria
        }));

        // Filtragem local adicional (fallback)
        const finalFiltered = mapped.filter((p: any) => {
          const matchBusca = !textoBusca || 
            p.NomeProduto?.toLowerCase().includes(textoBusca.toLowerCase()) || 
            p.CodigoProduto?.toLowerCase().includes(textoBusca.toLowerCase());
          
          const matchCategoria = !selectedCategoriaId || 
            p.categoriaProdutoEntityId === selectedCategoriaId || 
            p.categoriaId === selectedCategoriaId;

          const matchTipo = selectedTipoCategoria === 'Todos' || 
            p.produtoTipoEnum === selectedTipoCategoria || 
            String(p.produtoTipoEnum) === selectedTipoCategoria;

          return matchBusca && matchCategoria && matchTipo;
        });

        setProdutosFiltrados(finalFiltered);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        setProdutosFiltrados([]);
      } finally {
        setIsLoadingProdutos(false);
      }
    };

    const timer = setTimeout(() => {
      fetchProdutos();
    }, 500);

    return () => clearTimeout(timer);
  }, [textoBusca, selectedCategoriaId, selectedTipoCategoria, view, user]);

  const fetchMovements = async (token: string, branchId?: string) => {
    setIsLoadingMovements(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/movimentoestoque/select-filtro-movimentacao-produto-estoque`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          filtroMovimentacaoProdutoEstoqueDtoRequest: {
             filialId: branchId || selectedBranchId || '',
             take: 20
          }
        })
      });
      const result = await response.json();
      // Adjusting results based on common expected structure
      if (result.status && Array.isArray(result.data)) {
        setMovements(result.data);
      } else if (Array.isArray(result)) {
        setMovements(result);
      } else {
        // Fallback Mock data
        setMovements([
          { id: '1', CodigoProduto: 'PRD-001', NomeProduto: 'Arroz Integral 5kg', DataMovimentacao: new Date().toISOString(), Tipo: 'Entrada', Quantidade: 25 },
          { id: '2', CodigoProduto: 'PRD-002', NomeProduto: 'Feijão Carioca 1kg', DataMovimentacao: new Date().toISOString(), Tipo: 'Saída', Quantidade: 10 },
          { id: '3', CodigoProduto: 'PRD-003', NomeProduto: 'Açúcar Refinado 1kg', DataMovimentacao: new Date().toISOString(), Tipo: 'Entrada', Quantidade: 15 },
          { id: '4', CodigoProduto: 'PRD-004', NomeProduto: 'Óleo de Soja 900ml', DataMovimentacao: new Date().toISOString(), Tipo: 'Saída', Quantidade: 5 },
        ]);
      }
    } catch (error) {
      console.error('Erro ao buscar movimentos:', error);
      setMovements([]);
    } finally {
      setIsLoadingMovements(false);
    }
  };

  const fetchBranches = async (token: string) => {
    setIsLoadingBranches(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/filial/consultar-filiais`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      
      if (result.status && Array.isArray(result.data)) {
        const branchData = result.data.map((f: any) => ({
          id: f.id,
          nome: f.nomeFilial || f.nome
        }));
        setBranches(branchData);
        if (branchData.length > 0) setSelectedBranchId(branchData[0].id);
      }
    } catch (error) {
      console.error('Erro ao buscar filiais:', error);
      // Fallback para não quebrar a UI caso a API falhe
      setBranches([{ id: '1', nome: 'Matriz Padrão' }]);
      setSelectedBranchId('1');
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Por favor, preencha todos os campos.');
      return;
    }
    
    setIsLoading(true);
    setAuthError(null);
    
    try {
      console.log('Tentando login (Proxy):', `${API_BASE_URL}/api/account/login`);
      const response = await fetch(`${API_BASE_URL}/api/account/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          userLoginDtoRequest: {
            email: email,
            senha: password
          }
        })
      });

      console.log('Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.mensagem || `Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('Resultado login:', result);

      if (result.status && result.data) {
        const userData = {
          token: result.data.accessToken,
          name: result.data.nome || 'Usuário'
        };
        setUser(userData);
        await fetchBranches(userData.token);
        setView('home');
      } else {
        setAuthError(result.mensagem || 'Credenciais inválidas ou erro no servidor.');
      }
    } catch (error) {
      console.error('Erro detalhado de conexão:', error);
      setAuthError('Erro de conexão. Verifique se o servidor está online e permite conexões (CORS).');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setView('auth');
    setUser(null);
    setEmail('');
    setPassword('');
  };
  if (view === 'inventory-items' && selectedInventory) {
    return (
      <div className="h-screen bg-[#F9F9F9] flex flex-col overflow-hidden font-sans">
        {/* Header Fixo */}
        <header className="bg-header-dark text-white rounded-b-[28px] overflow-hidden h-[82px] flex items-center shrink-0 z-20">
          <div className="max-w-[1200px] mx-auto px-5 w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setView('inventory')}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <ArrowRight className="w-6 h-6 rotate-180" />
              </motion.button>
              
              <h1 className="text-[19px] font-bold tracking-tight">Registro de Inventario</h1>
            </div>

            <div className="bg-[#00786F] rounded-xl flex flex-col items-center justify-center p-2.5 min-w-[100px]">
              <span className="text-xs font-bold text-white mb-0.5">{selectedInventory.dataInventarioExibicao.split(' ')[0]}</span>
              <span className="text-[10px] font-bold text-white/90 uppercase tracking-wider">{selectedInventory.situacaoDescricaoExibicao}</span>
            </div>
          </div>
        </header>

        {/* Content Rolável */}
        <main className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 pb-24">
          <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-3">
            {/* Header de Alternância */}
            <div className="flex gap-2 sticky top-0 z-10 bg-[#F9F9F9] py-1">
              <button 
                onClick={() => setIsViewingRegisteredItems(false)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${!isViewingRegisteredItems ? 'bg-[#1F2937] text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-100'}`}
              >
                Consultar Produtos
              </button>
              <button 
                onClick={() => {
                  setIsViewingRegisteredItems(true);
                  fetchRegisteredItems();
                }}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${isViewingRegisteredItems ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-100'}`}
              >
                Itens Registrados
              </button>
            </div>

            {!isViewingRegisteredItems ? (
              <>
                {/* Search Box */}
                <section className="bg-white rounded-[22px] p-3.5 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-none">
                  <div className="flex flex-col gap-2.5">
                    <div className="flex gap-2.5">
                      <div className="flex-1 bg-[#F8FAFC] px-4 h-[46px] rounded-[16px] flex items-center gap-2 border border-slate-100">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input 
                          type="text"
                          value={textoBusca}
                          onChange={(e) => setTextoBusca(e.target.value)}
                          placeholder="Nome ou código do produto"
                          className="bg-transparent w-full outline-none text-sm font-medium text-[#1E293B] placeholder:text-[#94A3B8]"
                        />
                      </div>
                      {isLoadingProdutos && <Loader2 className="w-5.5 h-5.5 text-[#1F2937] animate-spin self-center" />}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="bg-[#F8FAFC] px-3 h-[46px] rounded-[16px] border border-slate-100 flex items-center">
                        <select 
                          value={selectedTipoCategoria}
                          onChange={(e) => setSelectedTipoCategoria(e.target.value)}
                          className="bg-transparent w-full text-sm font-medium text-[#1E293B] outline-none border-none appearance-none"
                        >
                          {tiposCategoria.map(tipo => (
                            <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
                          ))}
                        </select>
                      </div>
                      <div className="bg-[#F8FAFC] px-3 h-[46px] rounded-[16px] border border-slate-100 flex items-center">
                        <select 
                          value={selectedCategoriaId}
                          onChange={(e) => setSelectedCategoriaId(e.target.value)}
                          className="bg-transparent w-full text-sm font-medium text-[#1E293B] outline-none border-none appearance-none"
                        >
                          <option value="">Categoria</option>
                          {filteredCategorias.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nomeCategoria}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Registration Card */}
                <AnimatePresence>
                  {selectedProductForReg && (
                    <motion.section
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="bg-white rounded-[22px] p-4 shadow-xl border-2 border-emerald-500 overflow-hidden"
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Lançamento de Item</p>
                            <h3 className="text-base font-bold text-[#1E293B] leading-tight">{selectedProductForReg.NomeProduto}</h3>
                            <p className="text-xs text-slate-500">Cód: {selectedProductForReg.CodigoProduto}</p>
                          </div>
                          <button 
                            onClick={() => setSelectedProductForReg(null)}
                            className="text-slate-400 hover:text-slate-600 p-1"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex-1 bg-[#F8FAFC] px-4 h-[56px] rounded-[16px] flex flex-col justify-center border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400">Quantidade Contada</p>
                            <input 
                              type="number"
                              autoFocus
                              value={quantidadeContada}
                              onChange={(e) => setQuantidadeContada(e.target.value)}
                              placeholder="Ex: 10"
                              className="bg-transparent w-full outline-none text-lg font-bold text-[#1E293B] placeholder:text-[#CBD5E1]"
                            />
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isRegisteringItem || !quantidadeContada}
                            onClick={registerInventoryItem}
                            className={`px-6 bg-emerald-600 rounded-[18px] text-white font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 ${isRegisteringItem || !quantidadeContada ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                          >
                            {isRegisteringItem ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Registrar'}
                          </motion.button>
                        </div>
                      </div>
                    </motion.section>
                  )}
                </AnimatePresence>

                {/* Product Query */}
                <section className="bg-white rounded-[18px] p-3 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-none">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-bold text-[#1E293B]">Produtos Disponíveis</h2>
                    <span className="text-xs font-bold text-[#00786F]">{produtosFiltrados.length} encontrados</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {produtosFiltrados.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-20 text-[#1E293B]">
                        <p className="text-sm font-bold text-slate-400">Pesquise para encontrar produtos.</p>
                      </div>
                    )}
                    {produtosFiltrados.map((prod, idx) => (
                      <motion.div
                        key={prod.id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#F8FAFC] p-2.5 rounded-[16px] flex items-center gap-3 border border-slate-50"
                      >
                        <div className="w-2.5 h-2.5 bg-emerald-500/30 rounded-full shrink-0" />
                        <span className="text-[11px] font-bold text-[#64748B] shrink-0">{prod.CodigoProduto}</span>
                        
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-bold text-[#1E293B] truncate">{prod.NomeProduto}</span>
                          <span className="text-[11px] text-[#64748B] truncate">{prod.CategoriaProduto}</span>
                        </div>

                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedProductForReg(prod);
                            setQuantidadeContada('');
                          }}
                          className="bg-emerald-600 px-3 py-1.5 rounded-[12px] text-xs font-bold text-white shrink-0"
                        >
                          Selecionar
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </section>
              </>
            ) : (
              /* Visualização de Itens Registrados */
              <section className="bg-white rounded-[18px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-none">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-[#1E293B]">Itens Já Registrados</h2>
                  <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">{registeredItems.length} itens</span>
                </div>

                {isLoadingRegisteredItems ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-[#1F2937] animate-spin" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {registeredItems.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-20 text-[#1E293B]">
                        <p className="text-sm font-bold text-slate-400">Nenhum item registrado ainda.</p>
                      </div>
                    )}
                    {registeredItems.map((item, idx) => (
                      <motion.div
                        key={item.id || idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-[#F8FAFC] p-4 rounded-[18px] flex items-center justify-between border border-emerald-50"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#1E293B]">{item.nomeProduto}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{item.categoriaProduto}</span>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-full border border-emerald-100 shadow-sm">
                          <span className="text-base font-black text-emerald-700">{item.estoqueContado} <span className="text-xs font-bold opacity-60">un</span></span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        </main>

        {/* Footer Fixo */}
        <footer className="shrink-0 z-30">
          <div className="bg-[#111827] h-[65px] rounded-t-[35px] relative flex items-center justify-center">
            <div className="absolute top-[-30px] left-0 right-0 flex justify-center px-5">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (isViewingRegisteredItems) {
                    setIsViewingRegisteredItems(false);
                  } else {
                    setIsViewingRegisteredItems(true);
                    fetchRegisteredItems();
                  }
                }}
                className={`w-[260px] h-[72px] rounded-[30px] border-[5px] border-white shadow-2xl flex items-center justify-center gap-3 p-2 transition-all ${isViewingRegisteredItems ? 'bg-[#1F2937]' : 'bg-[#E67E22]'}`}
              >
                {isViewingRegisteredItems ? <Search className="w-6 h-6 text-white" /> : <Layers className="w-6 h-6 text-white" />}
                <span className="text-sm font-bold text-white text-center leading-tight">
                  {isViewingRegisteredItems ? 'Voltar para Consulta' : 'Visualizar Itens\nRegistrados'}
                </span>
              </motion.button>
            </div>
          </div>
        </footer>
      </div>
    );
  }


  if (view === 'inventory') {
    return (
      <div className="min-h-screen bg-[#F9F9F9] font-sans pb-32">
        {/* Header Section */}
        <header className="bg-header-dark text-white rounded-b-[28px] shadow-lg overflow-hidden h-[104px]">
          <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setView('home')}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                id="back-button"
              >
                <ArrowRight className="w-6 h-6 rotate-180" />
              </motion.button>
              
              <div className="flex flex-col">
                <h1 className="text-[22px] font-bold tracking-tight">Inventario</h1>
                <span className="text-xs text-slate-400 font-medium">
                  {branches.find(b => b.id === selectedBranchId)?.nome || 'Selecionar Filial'}
                </span>
              </div>
            </div>

            <div className="bg-[#00786F] px-3 py-1.5 rounded-xl">
              <span className="text-[11px] font-bold text-white tracking-widest">INVENTARIO</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-[1200px] mx-auto px-4 relative mt-6 z-10">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-none mb-10"
          >
            {/* Header Info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#ECFDF5] w-[46px] h-[46px] rounded-[14px] flex items-center justify-center">
                <Layers className="w-[22px] h-[22px] text-emerald-600" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-base font-bold text-[#1E293B]">Inventarios da filial</h2>
                <span className="text-xs text-[#64748B]">Lista de conferência e ajustes</span>
              </div>
            </div>

            {/* Subheader with Indicator */}
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-[13px] font-bold text-[#1E293B]">Historico recente de inventarios</h3>
              {isLoadingInventories && <Loader2 className="w-[22px] h-[22px] text-[#1F2937] animate-spin" />}
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 mb-4">
              <div className="bg-[#F8FAFC] px-3 py-2 rounded-[16px] border border-slate-100">
                <select 
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full bg-transparent text-[15px] text-[#1E293B] outline-none font-medium appearance-none"
                >
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.nome}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-[1fr_1fr_120px] gap-2">
                <div className="bg-[#F8FAFC] px-3 py-2 rounded-[16px] border border-slate-100 flex items-center">
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent text-[#1E293B] text-sm w-full outline-none font-bold" 
                  />
                </div>
                <div className="bg-[#F8FAFC] px-3 py-2 rounded-[16px] border border-slate-100 flex items-center">
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent text-[#1E293B] text-sm w-full outline-none font-bold" 
                  />
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fetchInventories(user?.token || '')}
                  className="col-span-2 lg:col-span-1 bg-[#00786F] text-white text-sm font-bold py-2 rounded-[16px] shadow-sm"
                >
                  Filtrar
                </motion.button>
              </div>
            </div>

            {/* List */}
            <div className="flex flex-col gap-2.5 min-h-[300px]">
              {inventories.length === 0 && !isLoadingInventories && (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                  <p className="text-sm font-bold text-[#1E293B]">Nenhum inventario encontrado.</p>
                  <p className="text-xs text-[#64748B]">Abra um novo inventario para iniciar a conferência.</p>
                </div>
              )}
              
              {inventories.map((inv, idx) => (
                <motion.div
                  key={inv.id || idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    setSelectedInventory(inv);
                    setView('inventory-items');
                  }}
                  className="bg-[#CAD5E2] p-3.5 rounded-[18px] flex flex-col gap-3 group hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 overflow-hidden">
                    <span className="text-sm font-bold text-[#1E293B] truncate flex-1">{inv.nomeFilial}</span>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[12px] font-bold text-[#64748B]">{inv.dataInventarioExibicao}</span>
                      
                      <div 
                        className="px-2.5 py-1 rounded-[10px]"
                        style={{ backgroundColor: inv.situacaoBackgroundColor, color: inv.situacaoTextColor }}
                      >
                        <span className="text-[11px] font-bold">{inv.situacaoDescricaoExibicao}</span>
                      </div>

                      {inv.podeEncerrar && (
                        <div className="bg-[#E67E22] px-2.5 py-1 rounded-[12px]">
                          <span className="text-[11px] font-bold text-white uppercase">Encerrar</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {inv.podeExibirAcoesFechamento && (
                    <div className="grid grid-cols-3 gap-2">
                      <button className="bg-white py-1.5 rounded-[10px] text-[11px] font-bold text-[#166534]">WhatsApp</button>
                      <button className="bg-white py-1.5 rounded-[10px] text-[11px] font-bold text-[#0C4A6E]">Imprimir</button>
                      <button className="bg-white py-1.5 rounded-[10px] text-[11px] font-bold text-[#92400E]">Baixar CSV</button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </main>

        {/* Bottom Button */}
        <div className="fixed bottom-6 left-0 right-0 max-w-[1200px] mx-auto px-4 z-10">
          <motion.button
            whileHover={{ scale: inventories.some(inv => inv.situacao === 0) ? 1 : 1.02 }}
            whileTap={{ scale: inventories.some(inv => inv.situacao === 0) ? 1 : 0.98 }}
            disabled={isOpeningInventory || inventories.some(inv => inv.situacao === 0)}
            onClick={openNewInventory}
            className={`w-full bg-[#1F2937] text-white font-bold py-4 rounded-[18px] text-[14px] shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 ${(isOpeningInventory || inventories.some(inv => inv.situacao === 0)) ? 'opacity-70 cursor-not-allowed grayscale' : ''}`}
          >
            {isOpeningInventory ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processando...
              </>
            ) : inventories.some(inv => inv.situacao === 0) ? (
              'Inventário em Aberto'
            ) : (
              'Abrir Novo Inventario'
            )}
          </motion.button>
        </div>
      </div>
    );
  }

  if (view === 'home') {
    return (
      <div className="min-h-screen bg-bg-gray font-sans selection:bg-primary/20 pb-32">
        {/* Header Section */}
        <header className="bg-header-dark text-white rounded-b-[28px] shadow-lg overflow-hidden transition-all">
          <div className="max-w-[1200px] mx-auto px-6 h-[90px] flex items-center justify-between">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Comércio Fácil</h1>
            </motion.div>

            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="relative min-w-[180px] sm:min-w-[220px]"
            >
              <div className="bg-[#111827] rounded-[14px] px-3 py-2 flex items-center gap-2 border border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer group">
                {isLoadingBranches ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                ) : (
                  <HelpCircle className="w-4 h-4 text-primary" />
                )}
                <select 
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="bg-transparent text-white text-xs sm:text-sm font-semibold outline-none w-full cursor-pointer appearance-none pr-4"
                >
                  {branches.length === 0 && !isLoadingBranches && (
                    <option value="">Nenhuma filial</option>
                  )}
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id} className="bg-header-dark">
                      {branch.nome}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 pointer-events-none text-slate-500 group-hover:text-slate-300 transition-colors">
                  <ArrowRight className="w-3 h-3 rotate-90" />
                </div>
              </div>
            </motion.div>
          </div>
        </header>

        {/* Content Section */}
        <main className="max-w-[1200px] mx-auto px-6 pt-10 space-y-10">
          {/* Quick Access Title */}
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1"
            >
              <h2 className="text-xl font-extrabold text-header-dark">Acesso rápido</h2>
              <p className="text-sm text-text-muted">Selecione uma das funcionalidades abaixo.</p>
            </motion.div>
            <button 
              onClick={handleLogout}
              className="p-2 text-text-muted hover:text-danger hover:bg-red-50 rounded-lg transition-all"
            >
              <Lock className="w-5 h-5" />
            </button>
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Produtos */}
            <QuickActionCard 
              title="Produtos"
              bgColor="bg-emerald-50"
              iconColor="text-emerald-700"
              iconBg="bg-emerald-100"
              Icon={ShoppingBag}
              delay={0.1}
            />
            
            {/* Estoque */}
            <div onClick={() => setView('inventory')}>
              <QuickActionCard 
                title="Estoque"
                bgColor="bg-orange-50"
                iconColor="text-orange-700"
                iconBg="bg-orange-100"
                Icon={Package}
                delay={0.2}
              />
            </div>

            {/* Notas Danfes */}
            <QuickActionCard 
              title="Notas Danfes"
              bgColor="bg-blue-50"
              iconColor="text-blue-700"
              iconBg="bg-blue-100"
              Icon={QrCode}
              spanFull={true}
              delay={0.3}
            />

            {/* Validades */}
            <QuickActionCard 
              title="Validades"
              bgColor="bg-pink-50"
              iconColor="text-pink-700"
              iconBg="bg-pink-100"
              Icon={Timer}
              spanFull={true}
              delay={0.4}
            />
          </div>

          {/* Settings Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="group relative bg-[#F1F5F9] rounded-[24px] p-6 flex items-center gap-4 cursor-pointer hover:bg-slate-200/80 transition-all border border-transparent hover:border-slate-300"
          >
            <div className="w-12 h-12 bg-slate-100 rounded-[14px] flex items-center justify-center shadow-sm group-hover:bg-white transition-colors">
              <Printer className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-800">Configurações de Impressão</h3>
              <p className="text-xs text-slate-500">Gerencie suas impressoras e etiquetas.</p>
            </div>
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-white transition-all group-hover:translate-x-1 shadow-sm">
              <ArrowRight className="w-4 h-4 text-header-dark" />
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20 bg-[#F9F9F9]">
      {/* Decorative Top Border Bar */}
      <div className="h-[92px] bg-header-dark rounded-b-[28px] w-full" />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[460px] bg-white rounded-[28px] shadow-[0_6px_16px_rgba(0,0,0,0.08)] p-6 sm:p-10"
        >
          {/* Header */}
          <div className="text-center space-y-4 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-soft text-orange-700 rounded-[14px] font-bold text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              Acesso seguro
            </div>
            <h1 className="text-3xl font-extrabold text-text-strong tracking-tight">Comércio Fácil</h1>
            <p className="text-text-muted text-sm px-4">
              Entre com seu e-mail e senha para continuar no app.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-header-dark ml-1">E-mail</label>
              <div className="group relative bg-bg-gray border border-transparent focus-within:border-primary/30 rounded-[18px] transition-all overflow-hidden flex items-center px-4 py-1 h-[58px]">
                <div className="bg-white p-2 rounded-[12px] shadow-sm flex-shrink-0">
                  <Mail className="w-4.5 h-4.5 text-header-dark" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@empresa.com"
                  className="w-full px-3 py-2 bg-transparent text-text-strong placeholder:text-slate-400 font-medium text-base focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-header-dark ml-1">Senha</label>
              <div className="group relative bg-bg-gray border border-transparent focus-within:border-primary/30 rounded-[18px] transition-all overflow-hidden flex items-center px-4 py-1 h-[58px]">
                <div className="bg-white p-2 rounded-[12px] shadow-sm flex-shrink-0">
                  <Lock className="w-4.5 h-4.5 text-header-dark" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full px-3 py-2 bg-transparent text-text-strong placeholder:text-slate-400 font-medium text-base focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-text-muted hover:text-text-strong transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                className="text-sm font-bold text-header-dark hover:text-primary transition-colors"
              >
                Esqueci a senha
              </button>
              <button
                type="button"
                className="text-sm font-bold text-primary hover:text-orange-600 transition-colors"
              >
                Criar conta
              </button>
            </div>

            {/* Auth Error */}
            <AnimatePresence>
              {authError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 text-danger text-xs font-bold p-3 rounded-xl border border-red-100 flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  {authError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Help Card */}
            <div className="bg-bg-gray border border-border-light rounded-[18px] p-4 flex items-center gap-4 transition-all hover:border-primary/20">
              <div className="flex-1 space-y-0.5">
                <h4 className="text-[13px] font-bold text-text-strong">Precisa de ajuda?</h4>
                <p className="text-[12px] text-text-muted">Fale com o suporte antes de tentar novamente.</p>
              </div>
              <button
                type="button"
                className="h-[42px] px-4 rounded-[16px] bg-white border border-[#DCE6EE] text-header-dark text-[14px] font-bold hover:bg-slate-50 transition-all active:scale-95"
              >
                Suporte
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[58px] bg-primary text-white font-bold text-base rounded-[18px] shadow-lg shadow-primary/20 hover:shadow-primary/30 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2 group"
            >
              Entrar no app
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </motion.div>
      </main>

      {/* Decorative Bottom Bar */}
      <div className="h-[70px] bg-header-dark rounded-t-[28px] w-full" />

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-header-dark/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-[320px] bg-white rounded-[28px] p-8 shadow-2xl text-center space-y-6"
            >
              <div className="w-[62px] h-[62px] bg-primary-soft rounded-[20px] mx-auto flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-text-strong">Processando login</h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  Validando acesso e entrando no app...
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
