/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Package, 
  User, 
  CheckCircle2,
  AlertCircle,
  Layers,
  Edit3,
  Filter,
  X,
  Store,
  LogIn,
  UserPlus,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogOut,
  ShieldCheck,
  Ruler,
  Tag,
  Box,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Category, UnitOfMeasure, Branch, PriceCategory, ProductPrice } from './types';

// Mock Data
const INITIAL_CATEGORIES: Category[] = [];

type View = 'products' | 'auth' | 'branches';
type ProductSubView = 'menu' | 'list' | 'categories' | 'units' | 'prices' | 'stock' | 'priceCategories' | 'assignPrices';

const API_BASE_URL = 'https://2d4l53ph-7141.brs.devtunnels.ms';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('auth');
  const [productSubView, setProductSubView] = useState<ProductSubView>('menu');
  const [user, setUser] = useState<{ name: string; email: string; token: string } | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Category API Handlers
  const fetchCategories = useCallback(async () => {
    if (!user?.token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/categoriaproduto/consultar-categorias-produtos`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const result = await response.json();
      if (result.status && Array.isArray(result.data)) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  }, [user?.token]);

  useEffect(() => {
    if (currentView === 'products' && productSubView === 'categories' && user) {
      fetchCategories();
    }
  }, [currentView, productSubView, user, fetchCategories]);

  // Units of Measure API Handlers
  const fetchUnits = useCallback(async () => {
    if (!user?.token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/unidademedidaproduto/consultar-unidades-medidas-produtos`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const result = await response.json();
      if (result.status && Array.isArray(result.data)) {
        setUnits(result.data);
      }
    } catch (error) {
      console.error('Erro ao buscar unidades:', error);
    }
  }, [user?.token]);

  useEffect(() => {
    if (currentView === 'products' && productSubView === 'units' && user) {
      fetchUnits();
    }
  }, [currentView, productSubView, user, fetchUnits]);

  // Products API Handlers
  const fetchProducts = useCallback(async () => {
    if (!user?.token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/produto`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const result = await response.json();
      if (result.status && Array.isArray(result.data)) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  }, [user?.token]);

  useEffect(() => {
    if (currentView === 'products' && productSubView === 'list' && user) {
      fetchProducts();
      fetchCategories();
      fetchUnits();
    }
  }, [currentView, productSubView, user, fetchProducts, fetchCategories, fetchUnits]);

  // Branches API Handlers
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [branchSearch, setBranchSearch] = useState('');

  const fetchBranches = useCallback(async () => {
    if (!user?.token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/filial/consultar-filiais`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const result = await response.json();
      if (result.status && Array.isArray(result.data)) {
        setBranches(result.data);
        // Auto-select first branch if none selected
        if (!selectedBranch && result.data.length > 0) {
          setSelectedBranch(result.data[0]);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar filiais:', error);
    }
  }, [user?.token, selectedBranch]);

  useEffect(() => {
    if (user?.token) {
      fetchBranches();
    }
  }, [user?.token, fetchBranches]);

  const filteredBranches = useMemo(() => {
    return branches.filter(b => 
      (b.nomeFilial || '').toLowerCase().includes((branchSearch || '').toLowerCase())
    );
  }, [branches, branchSearch]);
  
  // Categories State
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [categorySearch, setCategorySearch] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Units State
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [unitSearch, setUnitSearch] = useState('');

  // Products Management State
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Price Categories State
  const [priceCategories, setPriceCategories] = useState<PriceCategory[]>([]);
  const [priceCategorySearch, setPriceCategorySearch] = useState('');
  const [isPriceCategoryModalOpen, setIsPriceCategoryModalOpen] = useState(false);
  const [editingPriceCategory, setEditingPriceCategory] = useState<PriceCategory | null>(null);

  // Product Prices State
  const [productPrices, setProductPrices] = useState<ProductPrice[]>([]);
  const [productPriceSearch, setProductPriceSearch] = useState('');
  const [isProductPriceModalOpen, setIsProductPriceModalOpen] = useState(false);
  const [editingProductPrice, setEditingProductPrice] = useState<ProductPrice | null>(null);
  const [selectedProductForPrice, setSelectedProductForPrice] = useState<Product | null>(null);
  const [selectedBranchForPrice, setSelectedBranchForPrice] = useState<Branch | null>(null);
  const [selectedPriceCategoryForPrice, setSelectedPriceCategoryForPrice] = useState<PriceCategory | null>(null);

  // Price Categories API Handlers
  const fetchPriceCategories = useCallback(async () => {
    if (!user?.token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/categoriaprecoproduto/consultar-categorias-precos-produtos`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const result = await response.json();
      if (result.status && Array.isArray(result.data)) {
        setPriceCategories(result.data);
      }
    } catch (error) {
      console.error('Erro ao buscar categorias de preço:', error);
    }
  }, [user?.token]);

  useEffect(() => {
    if (currentView === 'products' && (productSubView === 'priceCategories' || productSubView === 'assignPrices') && user) {
      fetchPriceCategories();
    }
  }, [currentView, productSubView, user, fetchPriceCategories]);

  const filteredPriceCategories = useMemo(() => {
    return priceCategories.filter(pc => 
      (pc.categoriaPreco || '').toLowerCase().includes((priceCategorySearch || '').toLowerCase())
    );
  }, [priceCategories, priceCategorySearch]);

  const handleSavePriceCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.token) return;

    const formData = new FormData(e.currentTarget);
    const categoriaPreco = formData.get('categoriaPreco') as string;
    const habilitado = formData.get('habilitado') === 'on';

    try {
      if (editingPriceCategory) {
        const response = await fetch(`${API_BASE_URL}/api/categoriaprecoproduto/alterar-categoria-preco-produto`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({
            id: editingPriceCategory.id,
            categoriaPreco,
            habilitado
          })
        });
        const result = await response.json();
        if (result.status) {
          fetchPriceCategories();
          setIsPriceCategoryModalOpen(false);
          setEditingPriceCategory(null);
        } else {
          alert(result.mensagem || 'Erro ao atualizar categoria de preço');
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/api/categoriaprecoproduto/cadastrar-categoria-preco-produto`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ categoriaPreco })
        });
        const result = await response.json();
        if (result.status) {
          fetchPriceCategories();
          setIsPriceCategoryModalOpen(false);
          setEditingPriceCategory(null);
        } else {
          alert(result.mensagem || 'Erro ao cadastrar categoria de preço');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar categoria de preço:', error);
      alert('Erro de conexão com o servidor');
    }
  };

  // Product Prices API Handlers
  const fetchProductPrices = useCallback(async (priceCategoryEntityId?: string) => {
    if (!user?.token || !selectedBranchForPrice) return;

    const body: { filialEntityId: string; categoriaPrecoProdutoEntityId?: string } = {
      filialEntityId: selectedBranchForPrice.id,
    };
    if (priceCategoryEntityId) {
      body.categoriaPrecoProdutoEntityId = priceCategoryEntityId;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/precoproduto/consultar-preco-produto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(body)
      });
      const result = await response.json();
      if (result.status && Array.isArray(result.data)) {
        setProductPrices(result.data);
      }
    } catch (error) {
      console.error('Erro ao buscar preços de produtos:', error);
    }
  }, [user?.token, selectedBranchForPrice]);

  useEffect(() => {
    if (currentView === 'products' && productSubView === 'assignPrices' && user && selectedBranchForPrice) {
      // Only fetch if a price category is selected, otherwise wait for 'Consultar Todos'
      if (selectedPriceCategoryForPrice) {
        fetchProductPrices(selectedPriceCategoryForPrice.id);
      } else {
        setProductPrices([]); // Clear prices if no category is selected
      }
    }
  }, [currentView, productSubView, user, selectedBranchForPrice, selectedPriceCategoryForPrice, fetchProductPrices]);

  const filteredProductPrices = useMemo(() => {
    return productPrices.filter(pp => 
      (pp.nomeProduto || '').toLowerCase().includes((productPriceSearch || '').toLowerCase()) ||
      (pp.codigoProduto || '').toLowerCase().includes((productPriceSearch || '').toLowerCase())
    );
  }, [productPrices, productPriceSearch]);

  const handleConsultAllPrices = () => {
    if (selectedBranchForPrice) {
      setSelectedPriceCategoryForPrice(null); // Clear selected category
      fetchProductPrices(); // Fetch all prices for the selected branch
    } else {
      alert('Por favor, selecione uma filial para consultar todos os preços.');
    }
  };

  const handleSaveProductPrice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.token || !selectedProductForPrice || !selectedBranchForPrice || !selectedPriceCategoryForPrice) return;

    const formData = new FormData(e.currentTarget);
    const precoProduto = parseFloat(formData.get('precoProduto') as string);

    try {
      const response = await fetch(`${API_BASE_URL}/api/precoproduto/cadastrar-preco-produto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          produtoEntityId: selectedProductForPrice.id,
          filialEntityId: selectedBranchForPrice.id,
          categoriaPrecoProdutoEntityId: selectedPriceCategoryForPrice.id,
          precoProduto
        })
      });
      const result = await response.json();
      if (result.status) {
        fetchProductPrices();
        setIsProductPriceModalOpen(false);
        setEditingProductPrice(null);
        setSelectedProductForPrice(null);
      } else {
        alert(result.mensagem || 'Erro ao salvar preço do produto');
      }
    } catch (error) {
      console.error('Erro ao salvar preço do produto:', error);
      alert('Erro de conexão com o servidor');
    }
  };

  const openEditProductPrice = (productPrice: ProductPrice) => {
    setEditingProductPrice(productPrice);
    // To pre-select product, branch and price category in the modal
    setSelectedProductForPrice(products.find(p => p.id === productPrice.produtoEntityId) || null);
    setSelectedBranchForPrice(branches.find(b => b.id === productPrice.filialEntityId) || null);
    setSelectedPriceCategoryForPrice(priceCategories.find(pc => pc.id === productPrice.categoriaPrecoProdutoEntityId) || null);
    setIsProductPriceModalOpen(true);
  };

  // Category Logic
  const filteredCategories = useMemo(() => {
    return categories.filter(c => 
      (c.nomeCategoria || '').toLowerCase().includes((categorySearch || '').toLowerCase())
    );
  }, [categories, categorySearch]);

  const filteredUnits = useMemo(() => {
    return units.filter(u => {
      const name = u.nome || '';
      const sigla = u.sigla || '';
      const desc = u.descricao || '';
      const search = (unitSearch || '').toLowerCase();
      return name.toLowerCase().includes(search) || 
             sigla.toLowerCase().includes(search) || 
             desc.toLowerCase().includes(search);
    });
  }, [units, unitSearch]);

  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.token) return;

    const formData = new FormData(e.currentTarget);
    const nomeCategoria = formData.get('nomeCategoria') as string;
    const habilitado = formData.get('habilitado') === 'on';

    try {
      if (editingCategory) {
        const response = await fetch(`${API_BASE_URL}/api/categoriaproduto/atualizar-categoria-produto`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({
            id: editingCategory.id,
            nomeCategoria,
            habilitado
          })
        });
        const result = await response.json();
        if (result.status) {
          fetchCategories();
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        } else {
          alert(result.mensagem || 'Erro ao atualizar categoria');
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/api/categoriaproduto/cadastrar-categoria-produto`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ nomeCategoria })
        });
        const result = await response.json();
        if (result.status) {
          fetchCategories();
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        } else {
          alert(result.mensagem || 'Erro ao cadastrar categoria');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      alert('Erro de conexão com o servidor');
    }
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  // Product Management Logic
  const filteredProductsList = useMemo(() => {
    return products.filter(p => 
      (p.nomeProduto || '').toLowerCase().includes((productSearch || '').toLowerCase()) ||
      (p.codigoProduto || '').toLowerCase().includes((productSearch || '').toLowerCase())
    );
  }, [products, productSearch]);

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.token) return;

    const formData = new FormData(e.currentTarget);
    const nomeProduto = formData.get('nomeProduto') as string;
    const codigoProduto = formData.get('codigoProduto') as string;
    const categoriaProdutoEntityId = formData.get('categoriaProdutoEntityId') as string;
    const unidadeMedidaProdutoId = formData.get('unidadeMedidaProdutoId') as string;

    try {
      const url = `${API_BASE_URL}/api/produto`;
      const method = editingProduct ? 'PUT' : 'POST';
      const body = {
        ...(editingProduct && { id: editingProduct.id }),
        nomeProduto,
        codigoProduto,
        categoriaProdutoEntityId,
        unidadeMedidaProdutoId
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(body)
      });

      const result = await response.json();
      if (result.status) {
        fetchProducts();
        setIsProductModalOpen(false);
        setEditingProduct(null);
      } else {
        alert(result.mensagem || 'Erro ao salvar produto');
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro de conexão com o servidor');
    }
  };

  const toggleProductStatus = (id: string) => {
    // API doesn't seem to have a status toggle for products in the provided spec
    console.log('Toggle status for product:', id);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const openAssignPriceModal = (product: Product) => {
    if (!selectedBranch) {
      alert('Por favor, selecione uma filial primeiro.');
      return;
    }
    setEditingProductPrice(null);
    setSelectedProductForPrice(product);
    setSelectedBranchForPrice(selectedBranch);
    fetchPriceCategories(); // Ensure latest price categories are loaded
    setIsProductPriceModalOpen(true);
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const openEditPriceCategory = (priceCategory: PriceCategory) => {
    setEditingPriceCategory(priceCategory);
    setIsPriceCategoryModalOpen(true);
  };

  // Auth Handlers
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const senha = formData.get('senha') as string;

    try {
      const response = await fetch(`${API_BASE_URL}/api/account/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userLoginDtoRequest: { email, senha } 
        })
      });

      const result = await response.json();
      if (result.status && result.data?.sucesso) {
        setUser({
          name: result.data.nome,
          email: result.data.email,
          token: result.data.accessToken
        });
        setCurrentView('products');
        setProductSubView('menu');
      } else {
        setAuthError(result.mensagem || result.data?.erros?.[0] || 'Falha no login. Verifique suas credenciais.');
      }
    } catch (error) {
      setAuthError('Erro de conexão com o servidor.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    const formData = new FormData(e.currentTarget);
    const nome = formData.get('nome') as string;
    const sobreNome = formData.get('sobreNome') as string;
    const email = formData.get('email') as string;
    const senha = formData.get('senha') as string;
    const senhaConfirmacao = formData.get('senhaConfirmacao') as string;

    if (senha !== senhaConfirmacao) {
      setAuthError('As senhas não coincidem.');
      setAuthLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/account/criar-conta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userDtoCriarContaRequest: { nome, sobreNome, email, senha, senhaConfirmacao }
        })
      });

      const result = await response.json();
      if (result.status) {
        setAuthMode('login');
        setAuthError(null);
        alert('Conta criada com sucesso! Por favor, faça login.');
      } else {
        setAuthError(result.mensagem || 'Falha ao criar conta.');
      }
    } catch (error) {
      setAuthError('Erro de conexão com o servidor.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header / Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-y-4">
          <div className="flex items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <Store className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold tracking-tight hidden sm:block">EasyCashier</h1>
            </div>
            
            {user && (
              <nav className="flex items-center gap-1">
                <button 
                  onClick={() => {
                    setCurrentView('products');
                    setProductSubView('menu');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'products' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  Produtos
                </button>
              </nav>
            )}
          </div>
          
          {user && (
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex flex-col items-start sm:items-end">
                  <span className="text-sm font-bold text-slate-700 hidden sm:block">{user.name}</span>
                  <button 
                    onClick={() => setCurrentView('branches')}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
                  >
                    <Store className="w-3 h-3 group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:inline">{selectedBranch ? selectedBranch.nomeFilial : 'Selecionar Filial'}</span>
                    <span className="sm:hidden">Filial</span>
                  </button>
                </div>
              </div>
              <button 
                onClick={() => {
                  setUser(null);
                  setCurrentView('auth');
                  setSelectedBranch(null);
                }}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {currentView === 'auth' ? (
            <motion.div 
              key="auth-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto pt-12"
            >
              {/* Auth Form Content */}
              <div className="bg-white rounded-[32px] sm:rounded-[40px] shadow-2xl shadow-indigo-100/50 border border-slate-100 overflow-hidden">
                <div className="p-6 sm:p-10">
                  <div className="text-center mb-10">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl shadow-indigo-200 rotate-3">
                      <Store className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                      {authMode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2 font-medium">
                      {authMode === 'login' ? 'Acesse sua conta para gerenciar seu PDV' : 'Comece a gerenciar seu negócio hoje'}
                    </p>
                  </div>

                  {authError && (
                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-rose-50 border border-rose-100 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 text-rose-600 text-xs sm:text-sm font-medium animate-shake">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      {authError}
                    </div>
                  )}

                  <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-4 sm:space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                        <input 
                          name="email"
                          type="email" 
                          required
                          placeholder="seu@email.com"
                          className="w-full pl-12 pr-4 py-3 sm:py-4 bg-slate-50 border-none rounded-xl sm:rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Senha</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                        <input 
                          name="senha"
                          type={showPassword ? 'text' : 'password'} 
                          required
                          placeholder="••••••••"
                          className="w-full pl-12 pr-12 py-3 sm:py-4 bg-slate-50 border-none rounded-xl sm:rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />} 
                        </button>
                      </div>
                    </div>

                    {authMode === 'signup' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirmar Senha</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                          <input 
                            name="senhaConfirmacao"
                            type={showPassword ? 'text' : 'password'} 
                            required
                            placeholder="••••••••"
                            className="w-full pl-12 pr-4 py-3 sm:py-4 bg-slate-50 border-none rounded-xl sm:rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                          />
                        </div>
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-3 sm:py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl sm:rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      {authLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          {authMode === 'login' ? 'Entrar no Sistema' : 'Criar Conta'}
                          <LogIn className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-500 font-medium">
                      {authMode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                      <button 
                        onClick={() => {
                          setAuthMode(authMode === 'login' ? 'signup' : 'login');
                          setAuthError(null);
                        }}
                        className="ml-2 font-bold text-indigo-600 hover:underline"
                      >
                        {authMode === 'login' ? 'Cadastre-se' : 'Faça login'}
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : currentView === 'branches' ? (
            <motion.div 
              key="branches-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <button 
                onClick={() => setCurrentView('products')}
                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium text-sm mb-4"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar ao Menu
              </button>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Selecionar Filial</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">Escolha a filial que deseja gerenciar no momento.</p>
                </div>
              </div>

              <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Buscar filial por nome..."
                    value={branchSearch}
                    onChange={(e) => setBranchSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 sm:py-3 bg-slate-50 border-none rounded-lg sm:rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredBranches.map((branch) => (
                    <motion.button 
                      key={branch.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => {
                        setSelectedBranch(branch);
                        setCurrentView('products');
                      }}
                      className={`bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border transition-all text-left group relative overflow-hidden ${
                        selectedBranch?.id === branch.id 
                          ? 'border-indigo-600 ring-2 ring-indigo-600/10 shadow-lg' 
                          : 'border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-100'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${selectedBranch?.id === branch.id ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                          <Store className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        {selectedBranch?.id === branch.id && (
                          <div className="bg-indigo-600 text-white p-1 rounded-full">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-base sm:text-lg font-black text-slate-800 mb-0.5 sm:mb-1">{branch.nomeFilial}</h3>
                      <p className="text-xs text-slate-400 font-medium">ID: {branch.id}</p>

                      {selectedBranch?.id === branch.id && (
                        <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-indigo-600/5 rounded-bl-full -mr-6 -mt-6 sm:-mr-8 sm:-mt-8" />
                      )}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>

              {filteredBranches.length === 0 && (
                <div className="py-12 sm:py-20 text-center text-slate-400 bg-white rounded-2xl sm:rounded-3xl border border-dashed border-slate-200">
                  <Store className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-20" />
                  <p className="text-base sm:text-lg font-medium">Nenhuma filial encontrada</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="products-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {productSubView !== 'menu' && (
                <button 
                  onClick={() => setProductSubView('menu')}
                  className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium text-sm mb-2 sm:mb-4"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar ao Menu de Produtos
                </button>
              )}

              {productSubView === 'menu' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[
                    { id: 'list', title: 'Produtos', desc: 'Gerencie seu catálogo completo', icon: <Package className="w-8 h-8" />, color: 'bg-blue-50 text-blue-600' },
                    { id: 'categories', title: 'Categorias de Produtos', desc: 'Organize produtos por grupos', icon: <Layers className="w-8 h-8" />, color: 'bg-indigo-50 text-indigo-600' },
                    { id: 'units', title: 'Unidades Produto', desc: 'Gerencie unidades de medida', icon: <Ruler className="w-8 h-8" />, color: 'bg-emerald-50 text-emerald-600' },
                    { id: 'prices', title: 'Preços', desc: 'Tabelas de preços e promoções', icon: <Tag className="w-8 h-8" />, color: 'bg-amber-50 text-amber-600' },
                    { id: 'priceCategories', title: 'Categorias de Preço', desc: 'Gerencie categorias de preço', icon: <Tag className="w-8 h-8" />, color: 'bg-orange-50 text-orange-600' },
                    { id: 'assignPrices', title: 'Atribuir Preços', desc: 'Atribua preços aos produtos', icon: <Tag className="w-8 h-8" />, color: 'bg-purple-50 text-purple-600' },
                    { id: 'stock', title: 'Estoque', desc: 'Controle de entradas e saídas', icon: <Box className="w-8 h-8" />, color: 'bg-rose-50 text-rose-600' },
                  ].map((item) => (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setProductSubView(item.id as ProductSubView)}
                      className="bg-white p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all text-left flex flex-col gap-4 sm:gap-6 group"
                    >
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${item.color}`}>
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">{item.title}</h3>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">{item.desc}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : productSubView === 'priceCategories' ? (
                <div className="space-y-6">
                  {/* Price Categories Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Categorias de Preço</h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">Gerencie as categorias de preço dos seus produtos.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setEditingPriceCategory(null);
                        setIsPriceCategoryModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                      Nova Categoria de Preço
                    </button>
                  </div>

                  <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 sm:gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Buscar categoria de preço por nome..."
                        value={priceCategorySearch}
                        onChange={(e) => setPriceCategorySearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 sm:py-3 bg-slate-50 border-none rounded-lg sm:rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-bold border-b border-slate-100">
                          <th className="px-6 py-4">Categoria de Preço</th>
                          <th className="px-4 py-3 sm:px-6 sm:py-4">Habilitado</th>
                          <th className="px-6 py-4 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredPriceCategories.map((priceCategory) => (
                          <tr key={priceCategory.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4">
                              <span className="text-sm font-bold text-slate-700">{priceCategory.categoriaPreco}</span>
                            </td>
                            <td className="px-6 py-4">
                              {priceCategory.habilitado ? (
                                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold uppercase">Sim</span>
                              ) : (
                                <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded-md text-[10px] font-bold uppercase">Não</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => openEditPriceCategory(priceCategory)}
                                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : productSubView === 'list' ? (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Cadastro de Produtos</h2>
                      <p className="text-sm text-slate-500 mt-1">Gerencie seu catálogo de produtos e códigos de barras.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setEditingProduct(null);
                        setIsProductModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                      Novo Produto
                    </button>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Buscar por nome, código de barras ou SKU..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-bold border-b border-slate-100">
                          <th className="px-6 py-4">Produto / Código</th>
                          <th className="px-6 py-4">Categoria</th>
                          <th className="px-6 py-4">Unidade</th>
                          <th className="px-6 py-4 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredProductsList.map((product) => (
                          <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-700">{product.nomeProduto}</span>
                                <span className="text-[10px] font-mono text-slate-400">{product.codigoProduto}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-bold uppercase">{product.categoriaProduto}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold uppercase">{product.unidadeMedidaProduto}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => openEditProduct(product)}
                                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => openAssignPriceModal(product)}
                                  className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                >
                                  <Tag className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : productSubView === 'categories' ? (
                <div className="space-y-6">
                  {/* Categories Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Categorias de Produtos</h2>
                      <p className="text-sm text-slate-500 mt-1">Gerencie as classificações dos seus produtos no sistema.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setEditingCategory(null);
                        setIsCategoryModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                      Nova Categoria
                    </button>
                  </div>

                  {/* Filters & Search */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Buscar categorias por nome ou descrição..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                      />
                    </div>
                    <button className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
                      <Filter className="w-4 h-4" />
                      Filtros
                    </button>
                  </div>

                  {/* Categories Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                      {filteredCategories.map((category) => (
                        <motion.div 
                          key={category.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group overflow-hidden"
                        >
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className={`p-3 rounded-xl ${category.habilitado ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                <Layers className="w-6 h-6" />
                              </div>
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => openEditCategory(category)}
                                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            <h3 className="text-lg font-black text-slate-800 mb-1">{category.nomeCategoria}</h3>
                            
                            <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                              <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${category.habilitado ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                {category.habilitado ? 'Ativo' : 'Inativo'}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {filteredCategories.length === 0 && (
                    <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                      <Layers className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="text-lg font-medium">Nenhuma categoria encontrada</p>
                      <p className="text-sm">Tente ajustar sua busca ou crie uma nova categoria.</p>
                    </div>
                  )}
                </div>
              ) : productSubView === 'assignPrices' ? (
                <div className="space-y-6">
                  {/* Assign Prices Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Atribuir Preços</h2>
                      <p className="text-sm text-slate-500 mt-1">Atribua e gerencie os preços dos produtos por filial e categoria de preço.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setEditingProductPrice(null);
                        setSelectedProductForPrice(null);
                        setIsProductPriceModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                      Novo Preço de Produto
                    </button>
                  </div>

                  {/* Filters */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Buscar preço de produto por nome ou código..."
                        value={productPriceSearch}
                        onChange={(e) => setProductPriceSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                      />
                    </div>
                    <select
                      value={selectedBranchForPrice?.id || ''}
                      onChange={(e) => setSelectedBranchForPrice(branches.find(b => b.id === e.target.value) || null)}
                      className="w-full md:w-auto px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
                    >
                      <option value="">Filtrar por Filial</option>
                      {branches.map(branch => (
                        <option key={branch.id} value={branch.id}>{branch.nomeFilial}</option>
                      ))}
                    </select>
                    <select
                      value={selectedPriceCategoryForPrice?.id || ''}
                      onChange={(e) => setSelectedPriceCategoryForPrice(priceCategories.find(pc => pc.id === e.target.value) || null)}
                      className="w-full md:w-auto px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
                    >
                      <option value="">Filtrar por Categoria de Preço</option>
                      {priceCategories.map(pc => (
                        <option key={pc.id} value={pc.id}>{pc.categoriaPreco}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleConsultAllPrices}
                      disabled={!selectedBranchForPrice}
                      className="flex-shrink-0 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Consultar Todos
                    </button>
                  </div>

                  {/* Product Prices Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-bold border-b border-slate-100">
                          <th className="px-6 py-4">Produto</th>
                          <th className="px-6 py-4">Filial</th>
                          <th className="px-6 py-4">Categoria de Preço</th>
                          <th className="px-6 py-4">Preço</th>
                          <th className="px-6 py-4 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredProductPrices.map((productPrice) => (
                          <tr key={productPrice.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4">
                              <span className="text-sm font-bold text-slate-700">{productPrice.nomeProduto}</span>
                              <span className="block text-[10px] font-mono text-slate-400">{productPrice.codigoProduto}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase">{productPrice.nomeFilial}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded-md text-[10px] font-bold uppercase">{productPrice.categoriaPreco}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-bold text-slate-700">{productPrice.precoProduto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => openEditProductPrice(productPrice)}
                                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredProductPrices.length === 0 && (
                    <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                      <Tag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="text-lg font-medium">Nenhum preço de produto encontrado</p>
                      <p className="text-sm">Selecione uma filial e categoria de preço para visualizar ou atribuir preços.</p>
                    </div>
                  )}
                </div>
              ) : productSubView === 'units' ? (
                <div className="space-y-6">
                  {/* Units Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Unidades de Medida</h2>
                      <p className="text-sm text-slate-500 mt-1">Consulte as unidades de medida cadastradas para seus produtos.</p>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Buscar por nome ou sigla..."
                        value={unitSearch}
                        onChange={(e) => setUnitSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Units Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                      {filteredUnits.map((unit) => (
                        <motion.div 
                          key={unit.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group overflow-hidden"
                        >
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                                <Ruler className="w-6 h-6" />
                              </div>
                              <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                                {unit.sigla}
                              </span>
                            </div>
                            
                            <h3 className="text-lg font-black text-slate-800 mb-1">
                              {unit.nome}
                            </h3>
                            
                            <p className="text-sm text-slate-500 line-clamp-2 mt-2">
                              {unit.descricao}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {filteredUnits.length === 0 && (
                    <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                      <Ruler className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="text-lg font-medium">Nenhuma unidade encontrada</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-lg font-medium">Módulo em Desenvolvimento</p>
                  <p className="text-sm">Esta funcionalidade estará disponível em breve.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Product Price Create/Edit Modal */}
      <AnimatePresence>
        {isProductPriceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProductPriceModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">
                  {editingProductPrice ? 'Alterar Preço do Produto' : 'Novo Preço de Produto'}
                </h3>
                <button 
                  onClick={() => setIsProductPriceModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProductPrice} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Produto</label>
                    <select 
                      name="produtoEntityId"
                      required
                      defaultValue={editingProductPrice?.produtoEntityId || selectedProductForPrice?.id || ''}
                      onChange={(e) => setSelectedProductForPrice(products.find(p => p.id === e.target.value) || null)}
                      disabled={!!editingProductPrice}
                      className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <option value="">Selecionar Produto...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.nomeProduto} ({p.codigoProduto})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filial</label>
                    <select 
                      name="filialEntityId"
                      required
                      defaultValue={editingProductPrice?.filialEntityId || selectedBranchForPrice?.id || ''}
                      onChange={(e) => setSelectedBranchForPrice(branches.find(b => b.id === e.target.value) || null)}
                      disabled={!!editingProductPrice}
                      className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <option value="">Selecionar Filial...</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.nomeFilial}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categoria de Preço</label>
                    <select 
                      name="categoriaPrecoProdutoEntityId"
                      required
                      defaultValue={editingProductPrice?.categoriaPrecoProdutoEntityId || selectedPriceCategoryForPrice?.id || ''}
                      onChange={(e) => setSelectedPriceCategoryForPrice(priceCategories.find(pc => pc.id === e.target.value) || null)}
                      disabled={!!editingProductPrice}
                      className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <option value="">Selecionar Categoria de Preço...</option>
                      {priceCategories.map(pc => (
                        <option key={pc.id} value={pc.id}>{pc.categoriaPreco}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preço do Produto</label>
                    <input 
                      name="precoProduto"
                      type="number"
                      step="0.01"
                      required
                      defaultValue={editingProductPrice?.precoProduto || ''}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsProductPriceModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-100"
                  >
                    {editingProductPrice ? 'Salvar Alterações' : 'Atribuir Preço'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Create/Edit Modal */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProductModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">
                  {editingProduct ? 'Alterar Produto' : 'Novo Produto'}
                </h3>
                <button 
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nome do Produto</label>
                    <input 
                      name="nomeProduto"
                      required
                      defaultValue={editingProduct?.nomeProduto || ''}
                      placeholder="Nome completo do produto"
                      className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    />
                  </div>
                  
                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Código do Produto</label>
                    <input 
                      name="codigoProduto"
                      required
                      defaultValue={editingProduct?.codigoProduto || ''}
                      placeholder="Código interno ou EAN"
                      className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categoria</label>
                    <select 
                      name="categoriaProdutoEntityId"
                      required
                      defaultValue={editingProduct?.categoriaProdutoEntityId || ''}
                      className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
                    >
                      <option value="">Selecionar...</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.nomeCategoria}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unidade de Medida</label>
                    <select 
                      name="unidadeMedidaProdutoId"
                      required
                      defaultValue={editingProduct?.unidadeMedidaProdutoEntityId || ''}
                      className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
                    >
                      <option value="">Selecionar...</option>
                      {units.map(u => (
                        <option key={u.id} value={u.id}>{u.nome} ({u.sigla})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-100"
                  >
                    {editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Price Category Create/Edit Modal */}
      <AnimatePresence>
        {isPriceCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPriceCategoryModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">
                  {editingPriceCategory ? 'Alterar Categoria de Preço' : 'Nova Categoria de Preço'}
                </h3>
                <button 
                  onClick={() => setIsPriceCategoryModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePriceCategory} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nome da Categoria de Preço</label>
                  <input 
                    name="categoriaPreco"
                    required
                    defaultValue={editingPriceCategory?.categoriaPreco || ''}
                    placeholder="Ex: Atacado, Varejo..."
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">Categoria de Preço Ativa</span>
                    <span className="text-xs text-slate-400">Define se a categoria de preço está visível no sistema</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      name="habilitado"
                      type="checkbox" 
                      defaultChecked={editingPriceCategory ? editingPriceCategory.habilitado : true}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsPriceCategoryModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-100"
                  >
                    {editingPriceCategory ? 'Salvar Alterações' : 'Cadastrar Categoria de Preço'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Create/Edit Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">
                  {editingCategory ? 'Alterar Categoria' : 'Nova Categoria'}
                </h3>
                <button 
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nome da Categoria</label>
                  <input 
                    name="nomeCategoria"
                    required
                    defaultValue={editingCategory?.nomeCategoria || ''}
                    placeholder="Ex: Eletrônicos, Móveis..."
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">Categoria Ativa</span>
                    <span className="text-xs text-slate-400">Define se a categoria está visível no sistema</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      name="habilitado"
                      type="checkbox" 
                      defaultChecked={editingCategory ? editingCategory.habilitado : true}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-100"
                  >
                    {editingCategory ? 'Salvar Alterações' : 'Cadastrar Categoria'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
