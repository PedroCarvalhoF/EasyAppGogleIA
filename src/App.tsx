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
  Headphones,
  ShieldCheck,
  Ruler,
  Tag,
  Box,
  Users,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Truck,
  ArrowLeft,
  Wallet,
  Receipt,
  BarChart3,
  Calendar,
  Clock,
  ShoppingBag,
  TrendingUp,
  XCircle,
  CreditCard,
  Banknote,
  QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Category, UnitOfMeasure, Branch, PriceCategory, ProductPrice, UsuarioPdv, LinkedUser, PdvAberto, Pedido } from './types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Mock Data
const INITIAL_CATEGORIES: Category[] = [];

type View = 'products' | 'auth' | 'branches' | 'people' | 'pdv';
type ProductSubView = 'menu' | 'list' | 'categories' | 'units' | 'prices' | 'stock' | 'priceCategories' | 'assignPrices';
type PeopleSubView = 'menu' | 'posUsers' | 'customers' | 'suppliers';
type PdvSubView = 'caixasAbertos' | 'gestaoPedidos' | 'novoPedido' | 'orderDetails' | 'payment';

const API_BASE_URL = 'https://2d4l53ph-7141.brs.devtunnels.ms';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('auth');
  const [productSubView, setProductSubView] = useState<ProductSubView>('menu');
  const [peopleSubView, setPeopleSubView] = useState<PeopleSubView>('menu');
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

  // POS Users State
  const [posUsers, setPosUsers] = useState<UsuarioPdv[]>([]);
  const [posUserSearch, setPosUserSearch] = useState('');
  const [isPosUserModalOpen, setIsPosUserModalOpen] = useState(false);
  const [linkedUsers, setLinkedUsers] = useState<LinkedUser[]>([]);
  const [selectedLinkedUserId, setSelectedLinkedUserId] = useState('');
  const [posUserNickname, setPosUserNickname] = useState('');
  const [posUserPassword, setPosUserPassword] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [productsWithPrices, setProductsWithPrices] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // PDV State
  const [pdvsAbertos, setPdvsAbertos] = useState<PdvAberto[]>([]);
  const [pdvLoading, setPdvLoading] = useState(false);
  const [isNewPdvModalOpen, setIsNewPdvModalOpen] = useState(false);
  const [pdvFormLoading, setPdvFormLoading] = useState(false);
  const [selectedPdvSession, setSelectedPdvSession] = useState<PdvAberto | null>(null);
  const [pdvSubView, setPdvSubView] = useState<PdvSubView>('caixasAbertos');
  const [newOrderMesaCliente, setNewOrderMesaCliente] = useState('');
  const [selectedPriceCategoryId, setSelectedPriceCategoryId] = useState<string | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Pedido | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm });
  };

  const [orderFilter, setOrderFilter] = useState<'Todos' | 'Abertos' | 'Finalizados' | 'Cancelados'>('Todos');
  const [orderSearch, setOrderSearch] = useState('');

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
    if (((currentView === 'products' && (productSubView === 'priceCategories' || productSubView === 'assignPrices')) || (currentView === 'pdv' && pdvSubView === 'novoPedido')) && user) {
      fetchPriceCategories();
    }
  }, [currentView, productSubView, pdvSubView, user, fetchPriceCategories]);

  const handleCreateOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user?.token || !selectedPdvSession || !newOrderMesaCliente || !selectedPriceCategoryId) {
      setToast({ message: 'Por favor, preencha todos os campos e selecione uma categoria.', type: 'error' });
      return;
    }

    setOrderLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/pedido/novo-pedido`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          pontoVendaEntityId: selectedPdvSession.id,
          numeroPedido: newOrderMesaCliente,
          categoriaPrecoProdutoEntityId: selectedPriceCategoryId
        })
      });

      const result = await response.json();
      if (result.status) {
        setToast({ message: 'Pedido gerado com sucesso!', type: 'success' });
        
        const orderData = Array.isArray(result.data) ? result.data[0] : result.data;
        let finalOrder = null;
        if (typeof orderData === 'string') {
          finalOrder = await fetchOrderDetails(orderData);
        } else if (orderData && orderData.id) {
          if (!orderData.categoriaPrecoProdutoEntityId) {
            finalOrder = await fetchOrderDetails(orderData.id);
          } else {
            setSelectedOrder(orderData);
            finalOrder = orderData;
          }
        } else if (orderData && typeof orderData === 'object' && Object.keys(orderData).length === 0) {
          setToast({ message: 'Erro ao obter detalhes do pedido', type: 'error' });
          return;
        } else {
          finalOrder = await fetchOrderDetails(String(orderData));
        }
        
        if (finalOrder) {
          setPdvSubView('orderDetails');
          setNewOrderMesaCliente('');
          setSelectedPriceCategoryId(null);
        } else {
          setToast({ message: 'Erro ao carregar o pedido recém-criado', type: 'error' });
        }
      } else {
        setToast({ message: result.mensagem || 'Erro ao gerar pedido', type: 'error' });
      }
    } catch (error) {
      console.error('Erro ao gerar pedido:', error);
      setToast({ message: 'Erro de conexão com o servidor', type: 'error' });
    } finally {
      setOrderLoading(false);
    }
  };

  // POS Users API Handlers
  const fetchPosUsers = useCallback(async () => {
    if (!user?.token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/usuariopdv`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const result = await response.json();
      if (result.status && Array.isArray(result.data)) {
        setPosUsers(result.data);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários PDV:', error);
    }
  }, [user?.token]);

  // PDV API Handlers
  const fetchPdvsAbertos = useCallback(async () => {
    if (!user?.token) return;
    setPdvLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/pontovenda/pdvs-abertos`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const result = await response.json();
      if (result.status && Array.isArray(result.data)) {
        setPdvsAbertos(result.data);
      }
    } catch (error) {
      console.error('Erro ao buscar PDVs abertos:', error);
    } finally {
      setPdvLoading(false);
    }
  }, [user?.token]);

  const fetchOrderDetails = useCallback(async (pedidoId: string) => {
    if (!user?.token) return null;
    try {
      const response = await fetch(`${API_BASE_URL}/api/pedido/get-pedido`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ id: pedidoId })
      });
      const result = await response.json();
      if (result.status && result.data) {
        const order = Array.isArray(result.data) ? result.data[0] : result.data;
        setSelectedOrder(order);
        return order;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar detalhes do pedido:', error);
      return null;
    }
  }, [user?.token]);

  const handleInsertItemPedido = async (produtoId: string, quantidade: number, preco: number, desconto: number = 0, observacao: string = '') => {
    if (!user?.token || !selectedOrder) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/pedido/inserir-item-pedido`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          produtoId,
          quantidade,
          preco,
          desconto,
          observacao,
          pedidoId: selectedOrder.id
        })
      });
      const result = await response.json();
      if (result.status) {
        setSelectedOrder(result.data);
        setToast({ message: 'Item inserido com sucesso!', type: 'success' });
      } else {
        setToast({ message: result.mensagem || 'Erro ao inserir item', type: 'error' });
      }
    } catch (error) {
      console.error('Erro ao inserir item:', error);
      setToast({ message: 'Erro de conexão', type: 'error' });
    }
  };

  const handleRemoveItemPedido = async (idItemPedido: string) => {
    if (!user?.token || !selectedOrder) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/pedido/remover-item-pedido`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          idPedido: selectedOrder.id,
          idItemPedido
        })
      });
      const result = await response.json();
      if (result.status) {
        setToast({ message: 'Item removido com sucesso!', type: 'success' });
        fetchOrderDetails(selectedOrder.id);
      } else {
        setToast({ message: result.mensagem || 'Erro ao remover item', type: 'error' });
      }
    } catch (error) {
      console.error('Erro ao remover item:', error);
    }
  };

  const handleAddItemToOrder = (product: any) => {
    handleInsertItemPedido(product.produtoEntityId, 1, product.precoProduto);
  };

  const handleRemoveItemFromOrder = (itemId: string) => {
    handleRemoveItemPedido(itemId);
  };

  const handleRemoveAllItemsPedido = async () => {
    if (!user?.token || !selectedOrder) return;
    showConfirm(
      'Remover todos os itens',
      'Deseja realmente remover TODOS os itens deste pedido?',
      async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/pedido/remover-todos-itens-pedido`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
              pedidoId: selectedOrder.id
            })
          });
          const result = await response.json();
          if (result.status) {
            fetchOrderDetails(selectedOrder.id);
            setToast({ message: 'Todos os itens removidos!', type: 'success' });
          }
        } catch (error) {
          console.error('Erro ao remover todos os itens:', error);
        }
      }
    );
  };

  const handleCancelPedido = async () => {
    if (!user?.token || !selectedOrder) return;
    showConfirm(
      'Cancelar pedido',
      'Deseja realmente CANCELAR este pedido?',
      async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/pedido/cancelar-pedido`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
              pedidoId: selectedOrder.id
            })
          });
          const result = await response.json();
          if (result.status) {
            setToast({ message: 'Pedido cancelado!', type: 'success' });
            setPdvSubView('gestaoPedidos');
            fetchPedidos();
          }
        } catch (error) {
          console.error('Erro ao cancelar pedido:', error);
        }
      }
    );
  };

  const fetchProductsWithPrices = useCallback(async (priceCategoryId: string) => {
    if (!user?.token) return;
    setLoadingProducts(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/precoproduto/consultar-preco-produto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          categoriaPrecoProdutoEntityId: priceCategoryId
        })
      });
      const result = await response.json();
      if (result.status && Array.isArray(result.data)) {
        setProductsWithPrices(result.data);
      } else {
        setProductsWithPrices([]);
      }
    } catch (error) {
      console.error('Erro ao buscar produtos com preços:', error);
      setProductsWithPrices([]);
    } finally {
      setLoadingProducts(false);
    }
  }, [user?.token]);

  const fetchPedidos = useCallback(async () => {
    if (!user?.token || !selectedPdvSession) return;
    setOrderLoading(true);
    try {
      // Fetch all orders for the PDV session to allow correct accounting
      const body: any = {
        pontoVendaEnitityId: selectedPdvSession.id
      };

      const response = await fetch(`${API_BASE_URL}/api/pedido/get-pedido`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(body)
      });
      const result = await response.json();
      if (result.status && Array.isArray(result.data)) {
        setPedidos(result.data);
      } else {
        setPedidos([]);
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      setPedidos([]);
    } finally {
      setOrderLoading(false);
    }
  }, [user?.token, selectedPdvSession]);

  useEffect(() => {
    if (currentView === 'pdv' && pdvSubView === 'gestaoPedidos' && selectedPdvSession && user) {
      fetchPedidos();
    }
  }, [currentView, pdvSubView, selectedPdvSession, user, fetchPedidos]);

  useEffect(() => {
    if (currentView === 'pdv' && pdvSubView === 'orderDetails' && selectedOrder && user) {
      fetchProductsWithPrices(selectedOrder.categoriaPrecoProdutoEntityId);
    }
  }, [currentView, pdvSubView, selectedOrder, user, fetchProductsWithPrices]);

  useEffect(() => {
    if (currentView === 'pdv' && user) {
      fetchPdvsAbertos();
      fetchPosUsers();
    }
  }, [currentView, user, fetchPdvsAbertos, fetchPosUsers]);

  const handleCreatePdv = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.token || !selectedBranch) return;

    const formData = new FormData(e.currentTarget);
    const usuarioPdvId = formData.get('usuarioPdvId') as string;
    const descricaoPeriodo = formData.get('descricaoPeriodo') as string;

    if (!usuarioPdvId || !descricaoPeriodo) {
      setToast({ message: 'Por favor, preencha todos os campos.', type: 'error' });
      return;
    }

    setPdvFormLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/pontovenda/novo-pdv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          filialId: selectedBranch.id,
          usuarioPdvId,
          descricaoPeriodo
        })
      });

      const result = await response.json();
      if (result.status) {
        setToast({ message: 'Caixa aberto com sucesso!', type: 'success' });
        setIsNewPdvModalOpen(false);
        fetchPdvsAbertos();
      } else {
        setToast({ message: result.mensagem || 'Erro ao abrir caixa', type: 'error' });
      }
    } catch (error) {
      console.error('Erro ao abrir caixa:', error);
      setToast({ message: 'Erro de conexão com o servidor', type: 'error' });
    } finally {
      setPdvFormLoading(false);
    }
  };

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

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (currentView === 'people' && peopleSubView === 'posUsers' && user) {
      fetchPosUsers();
    }
  }, [currentView, peopleSubView, user, fetchPosUsers]);

  const filteredPosUsers = useMemo(() => {
    return posUsers.filter(u => 
      (u.usuarioCaixaPdvEntityNome || '').toLowerCase().includes((posUserSearch || '').toLowerCase()) ||
      (u.email || '').toLowerCase().includes((posUserSearch || '').toLowerCase()) ||
      (u.apelidoOperadorCaixa || '').toLowerCase().includes((posUserSearch || '').toLowerCase())
    );
  }, [posUsers, posUserSearch]);

  const fetchLinkedUsers = useCallback(async () => {
    if (!user?.token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarioclientevinculo/select-usuarios-vinculados-by-cliente-id`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const result = await response.json();
      if (result.status && Array.isArray(result.data)) {
        setLinkedUsers(result.data);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários vinculados:', error);
    }
  }, [user?.token]);

  const handleSavePosUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token || !selectedLinkedUserId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/usuariopdv/cadastrar-usuario-pdv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          usuarioCaixaPdvEntityId: selectedLinkedUserId,
          senhaUsuarioPdv: parseInt(posUserPassword) || 0,
          apelidoOperadorCaixa: posUserNickname
        })
      });
      const result = await response.json();
      if (result.status) {
        setToast({ message: 'Usuário com permissão para acesso a vendas!', type: 'success' });
        fetchPosUsers();
        setIsPosUserModalOpen(false);
        setSelectedLinkedUserId('');
        setPosUserNickname('');
        setPosUserPassword('');
      } else {
        setToast({ message: result.mensagem || 'Erro ao cadastrar usuário PDV', type: 'error' });
      }
    } catch (error) {
      console.error('Erro ao salvar usuário PDV:', error);
      setToast({ message: 'Erro de conexão com o servidor', type: 'error' });
    }
  };

  const handleTogglePosUserAccess = async (posUser: UsuarioPdv) => {
    if (!user?.token) return;

    const newAcesso = !posUser.acessoCaixa;

    try {
      const response = await fetch(`${API_BASE_URL}/api/usuariopdv/alterar-acesso-usuario-pdv`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          acessoCaixa: newAcesso,
          usuarioCaixaPdvEntityId: posUser.usuarioCaixaPdvEntityId
        })
      });
      const result = await response.json();
      if (result.status) {
        setToast({ 
          message: newAcesso ? 'Acesso liberado com sucesso!' : 'Acesso bloqueado com sucesso!', 
          type: newAcesso ? 'success' : 'error' 
        });
        fetchPosUsers();
      } else {
        setToast({ message: result.mensagem || 'Erro ao alterar acesso', type: 'error' });
      }
    } catch (error) {
      console.error('Erro ao alterar acesso do usuário PDV:', error);
      setToast({ message: 'Erro de conexão com o servidor', type: 'error' });
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
      {user && currentView !== 'pdv' && (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-8">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <Store className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight hidden md:block">EasyCashier</h1>
            </div>
            
            {user && (
              <nav className="flex items-center gap-0.5 sm:gap-1">
                <button 
                  onClick={() => {
                    setCurrentView('products');
                    setProductSubView('menu');
                  }}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${currentView === 'products' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  Produtos
                </button>
                <button 
                  onClick={() => {
                    setCurrentView('people');
                    setPeopleSubView('menu');
                  }}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${currentView === 'people' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  Pessoas
                </button>
                <button 
                  onClick={() => {
                    setCurrentView('pdv');
                  }}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${currentView === 'pdv' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  PDV
                </button>
              </nav>
            )}
          </div>
          
          {user && (
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
                </div>
                <div className="flex flex-col items-start sm:items-end overflow-hidden max-w-[80px] sm:max-w-none">
                  <span className="text-xs sm:text-sm font-bold text-slate-700 truncate w-full hidden sm:block">{user.name}</span>
                  <button 
                    onClick={() => setCurrentView('branches')}
                    className="text-[9px] sm:text-[10px] font-black text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group truncate w-full"
                  >
                    <Store className="w-2.5 h-2.5 group-hover:scale-110 transition-transform flex-shrink-0" />
                    <span className="truncate">{selectedBranch ? selectedBranch.nomeFilial : 'Filial'}</span>
                  </button>
                </div>
              </div>
              <button 
                onClick={() => {
                  setUser(null);
                  setCurrentView('auth');
                  setSelectedBranch(null);
                }}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
                title="Sair"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}
        </div>
      </header>
      )}

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
              <div className="bg-white rounded-[26px] shadow-[0_10px_20px_rgba(0,0,0,0.08)] border border-[#E7ECF3] overflow-hidden max-w-[420px] mx-auto">
                <div className="p-6 sm:p-8">
                  <div className="text-center mb-8">
                    <div className="w-[58px] h-[58px] bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-200">
                      <Store className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-[24px] font-black text-[#1D293D] tracking-tight mb-1">
                      Comércio Fácil
                    </h2>
                    <p className="text-[13px] text-[#62748E] font-medium mb-3">
                      Acesse sua conta para continuar
                    </p>
                    <div className="inline-flex items-center justify-center bg-[#F3F0FF] rounded-[14px] px-3 py-1.5">
                      <span className="text-[11px] font-black text-[#533FF6] uppercase tracking-wider">Login seguro</span>
                    </div>
                  </div>

                  {authError && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-medium animate-shake">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      {authError}
                    </div>
                  )}

                  <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">E-mail</label>
                      <div className="relative flex items-center bg-white border border-[#E7ECF3] rounded-[16px] p-1 focus-within:border-[#533FF6] focus-within:ring-1 focus-within:ring-[#533FF6] transition-all">
                        <div className="bg-[#F8FAFC] p-2.5 rounded-[10px] ml-1">
                          <Mail className="w-4 h-4 text-[#94A3B8]" />
                        </div>
                        <input 
                          name="email"
                          type="email" 
                          required
                          placeholder="seuemail@empresa.com"
                          className="w-full pl-3 pr-4 py-3 bg-transparent border-none text-[14px] text-[#1D293D] placeholder:text-[#94A3B8] focus:ring-0 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Senha</label>
                      <div className="relative flex items-center bg-white border border-[#E7ECF3] rounded-[16px] p-1 focus-within:border-[#533FF6] focus-within:ring-1 focus-within:ring-[#533FF6] transition-all">
                        <div className="bg-[#F8FAFC] p-2.5 rounded-[10px] ml-1">
                          <Lock className="w-4 h-4 text-[#94A3B8]" />
                        </div>
                        <input 
                          name="senha"
                          type={showPassword ? 'text' : 'password'} 
                          required
                          placeholder="••••••••"
                          className="w-full pl-3 pr-12 py-3 bg-transparent border-none text-[14px] text-[#1D293D] placeholder:text-[#94A3B8] focus:ring-0 outline-none"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 text-[#94A3B8] hover:text-[#533FF6] transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} 
                        </button>
                      </div>
                    </div>

                    {authMode === 'signup' && (
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Confirmar Senha</label>
                        <div className="relative flex items-center bg-white border border-[#E7ECF3] rounded-[16px] p-1 focus-within:border-[#533FF6] focus-within:ring-1 focus-within:ring-[#533FF6] transition-all">
                          <div className="bg-[#F8FAFC] p-2.5 rounded-[10px] ml-1">
                            <Lock className="w-4 h-4 text-[#94A3B8]" />
                          </div>
                          <input 
                            name="senhaConfirmacao"
                            type={showPassword ? 'text' : 'password'} 
                            required
                            placeholder="••••••••"
                            className="w-full pl-3 pr-4 py-3 bg-transparent border-none text-[14px] text-[#1D293D] placeholder:text-[#94A3B8] focus:ring-0 outline-none"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 pb-2">
                      <button 
                        type="button"
                        className="text-[12px] font-black text-[#45556C] hover:text-[#1D293D] transition-colors"
                      >
                        Esqueci a senha
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          setAuthMode(authMode === 'login' ? 'signup' : 'login');
                          setAuthError(null);
                        }}
                        className="text-[12px] font-black text-[#533FF6] hover:text-indigo-700 transition-colors"
                      >
                        {authMode === 'login' ? 'Criar conta' : 'Fazer login'}
                      </button>
                    </div>

                    <button 
                      type="submit"
                      disabled={authLoading}
                      className="w-full h-[56px] bg-[#533FF6] hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-[18px] font-black text-[16px] transition-all shadow-[0_10px_18px_rgba(83,63,246,0.16)] flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      {authLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        authMode === 'login' ? 'Entrar' : 'Criar Conta'
                      )}
                    </button>
                  </form>

                  <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-[1px] bg-[#EEF2F7]"></div>
                    <span className="text-[12px] text-[#94A3B8] font-medium">ou</span>
                    <div className="flex-1 h-[1px] bg-[#EEF2F7]"></div>
                  </div>

                  <button 
                    type="button"
                    className="w-full h-[52px] bg-[#F8FAFC] border border-[#E7ECF3] hover:bg-slate-100 text-[#45556C] rounded-[18px] font-black text-[14px] transition-all flex items-center justify-center gap-2"
                  >
                    <Headphones className="w-4 h-4" />
                    Falar com suporte
                  </button>
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
          ) : currentView === 'people' ? (
            <motion.div 
              key="people-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {peopleSubView !== 'menu' && (
                <button 
                  onClick={() => {
                    if (peopleSubView === 'posUsers') {
                      setCurrentView('pdv');
                    } else {
                      setPeopleSubView('menu');
                    }
                  }}
                  className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium text-sm mb-2 sm:mb-4"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar
                </button>
              )}

              {peopleSubView === 'menu' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[
                    { id: 'customers', title: 'Clientes', desc: 'Cadastro de clientes e histórico', icon: <User className="w-8 h-8" />, color: 'bg-emerald-50 text-emerald-600' },
                    { id: 'suppliers', title: 'Fornecedores', desc: 'Gerencie seus fornecedores', icon: <Store className="w-8 h-8" />, color: 'bg-amber-50 text-amber-600' },
                  ].map((item) => (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPeopleSubView(item.id as PeopleSubView)}
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
              ) : peopleSubView === 'posUsers' ? (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Usuários PDV</h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">Gerencie os usuários que têm acesso ao ponto de venda.</p>
                    </div>
                    <button 
                      onClick={() => {
                        fetchLinkedUsers();
                        setIsPosUserModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg sm:rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                      Novo Usuário PDV
                    </button>
                  </div>

                  <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 sm:gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Buscar usuário por nome ou e-mail..."
                        value={posUserSearch}
                        onChange={(e) => setPosUserSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 sm:py-3 bg-slate-50 border-none rounded-lg sm:rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 text-slate-400 text-[10px] sm:text-[11px] uppercase tracking-widest font-bold border-b border-slate-100">
                            <th className="px-4 py-3 sm:px-6 sm:py-4">Nome</th>
                            <th className="px-4 py-3 sm:px-6 sm:py-4">Apelido</th>
                            <th className="px-4 py-3 sm:px-6 sm:py-4">E-mail</th>
                            <th className="px-4 py-3 sm:px-6 sm:py-4">Acesso</th>
                            <th className="px-4 py-3 sm:px-6 sm:py-4 text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {filteredPosUsers.map((posUser) => (
                            <tr key={posUser.usuarioCaixaPdvEntityId} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-4 py-3 sm:px-6 sm:py-4">
                                <span className="text-sm font-bold text-slate-700">{posUser.usuarioCaixaPdvEntityNome}</span>
                              </td>
                              <td className="px-4 py-3 sm:px-6 sm:py-4">
                                <span className="text-sm text-slate-500">{posUser.apelidoOperadorCaixa}</span>
                              </td>
                              <td className="px-4 py-3 sm:px-6 sm:py-4">
                                <span className="text-sm text-slate-500">{posUser.email}</span>
                              </td>
                              <td className="px-4 py-3 sm:px-6 sm:py-4">
                                {posUser.acessoCaixa ? (
                                  <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold uppercase">Liberado</span>
                                ) : (
                                  <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded-md text-[10px] font-bold uppercase">Bloqueado</span>
                                )}
                              </td>
                              <td className="px-4 py-3 sm:px-6 sm:py-4">
                                <div className="flex items-center justify-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold uppercase ${posUser.acessoCaixa ? 'text-emerald-600' : 'text-slate-400'}`}>
                                      {posUser.acessoCaixa ? 'Ativo' : 'Inativo'}
                                    </span>
                                    <button
                                      onClick={() => handleTogglePosUserAccess(posUser)}
                                      className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
                                        posUser.acessoCaixa ? 'bg-emerald-500' : 'bg-slate-300'
                                      }`}
                                    >
                                      <motion.div
                                        animate={{ x: posUser.acessoCaixa ? 20 : 2 }}
                                        className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                      />
                                    </button>
                                  </div>
                                  <div className="h-4 w-px bg-slate-100" />
                                  <div className="flex items-center gap-1">
                                    <button className="p-1.5 sm:p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md sm:rounded-lg transition-all">
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md sm:rounded-lg transition-all">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card List */}
                    <div className="sm:hidden divide-y divide-slate-100">
                      {filteredPosUsers.map((posUser) => (
                        <div key={posUser.usuarioCaixaPdvEntityId} className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-sm font-black text-slate-800">{posUser.usuarioCaixaPdvEntityNome}</h4>
                              <p className="text-xs text-slate-500">{posUser.email}</p>
                            </div>
                            {posUser.acessoCaixa ? (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black uppercase tracking-wider">Liberado</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md text-[9px] font-black uppercase tracking-wider">Bloqueado</span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Apelido</span>
                              <span className="text-xs font-bold text-slate-600">{posUser.apelidoOperadorCaixa}</span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleTogglePosUserAccess(posUser)}
                                className={`relative w-9 h-4.5 rounded-full transition-colors duration-200 focus:outline-none ${
                                  posUser.acessoCaixa ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}
                              >
                                <motion.div
                                  animate={{ x: posUser.acessoCaixa ? 18 : 2 }}
                                  className="absolute top-0.75 w-3 h-3 bg-white rounded-full shadow-sm"
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                              </button>
                              <div className="flex items-center gap-1">
                                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {filteredPosUsers.length === 0 && (
                      <div className="px-6 py-10 text-center text-slate-400">
                        Nenhum usuário PDV encontrado.
                      </div>
                    )}
                  </div>
                </div>
              ) : peopleSubView === 'customers' ? (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Clientes</h2>
                      <p className="text-sm text-slate-500 mt-1">Gerencie o cadastro de seus clientes.</p>
                    </div>
                    <button className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95">
                      <Plus className="w-5 h-5" />
                      Novo Cliente
                    </button>
                  </div>
                  <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">Módulo de Clientes</p>
                    <p className="text-sm">Esta funcionalidade estará disponível em breve.</p>
                  </div>
                </div>
              ) : peopleSubView === 'suppliers' ? (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Fornecedores</h2>
                      <p className="text-sm text-slate-500 mt-1">Gerencie o cadastro de seus fornecedores.</p>
                    </div>
                    <button className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95">
                      <Plus className="w-5 h-5" />
                      Novo Fornecedor
                    </button>
                  </div>
                  <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                    <Truck className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">Módulo de Fornecedores</p>
                    <p className="text-sm">Esta funcionalidade estará disponível em breve.</p>
                  </div>
                </div>
              ) : null}
            </motion.div>
          ) : currentView === 'pdv' ? (
            <motion.div 
              key="pdv-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen bg-slate-50 flex flex-col"
            >
              {/* PDV Header */}
              <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      if (pdvSubView === 'caixasAbertos') {
                        setCurrentView('products');
                      } else if (pdvSubView === 'gestaoPedidos') {
                        setPdvSubView('caixasAbertos');
                        setSelectedPdvSession(null);
                      } else if (pdvSubView === 'novoPedido' || pdvSubView === 'orderDetails') {
                        setPdvSubView('gestaoPedidos');
                      } else if (pdvSubView === 'payment') {
                        setPdvSubView('orderDetails');
                      }
                    }}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {pdvSubView === 'caixasAbertos' ? 'Sair PDV' : 'Voltar'}
                  </button>
                  <div className="h-6 w-px bg-slate-200 hidden sm:block" />
                  <div className="hidden sm:flex items-center gap-2">
                    <Store className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">PDV</span>
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                      {pdvSubView === 'caixasAbertos' ? 'Caixas Abertos' : 
                       pdvSubView === 'gestaoPedidos' ? 'Gestão de Pedidos' :
                       pdvSubView === 'novoPedido' ? 'Novo Pedido' :
                       pdvSubView === 'orderDetails' ? 'Itens do Pedido' : 'Pagamento'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  {selectedPdvSession && (
                    <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex flex-col items-start">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Sessão Ativa</span>
                        <span className="text-xs font-black text-slate-700 leading-none">{selectedPdvSession.descricaoPeriodo}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Operador</span>
                      <span className="text-sm font-black text-slate-700 leading-none">{user?.name}</span>
                    </div>
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                      <User className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {pdvSubView === 'caixasAbertos' && (
                  <div className="max-w-[1600px] mx-auto p-4 sm:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left 2/3: Open PDVs */}
                      <div className="lg:col-span-2 bg-white border border-[#D9E2EC] rounded-[22px] p-4 sm:p-6 shadow-sm">
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <h2 className="text-[20px] font-black text-[#1D293D] tracking-tight">Caixas abertos</h2>
                            <p className="text-[13px] text-[#62748E] font-medium mt-1">Selecione um caixa para continuar as vendas</p>
                          </div>
                          <div className="bg-[#ECFDF5] px-3 py-1.5 rounded-[14px]">
                            <span className="text-[11px] font-black text-[#15803D]">Operação ativa</span>
                          </div>
                        </div>

                        {pdvLoading ? (
                          <div className="flex justify-center py-12">
                            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                          </div>
                        ) : pdvsAbertos.length > 0 ? (
                          <div className="space-y-4">
                            {pdvsAbertos.map((pdv) => (
                              <motion.div 
                                key={pdv.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white border border-[#D9E2EC] rounded-[18px] p-4 hover:shadow-md transition-all"
                              >
                                {/* Top */}
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-[16px] font-black text-[#1D293D] truncate pr-4">{pdv.filialPdv}</h4>
                                  <div className={`px-3 py-1.5 rounded-[12px] flex-shrink-0 ${pdv.aberto ? 'bg-[#ECFDF5]' : 'bg-[#FEF2F2]'}`}>
                                    <span className={`text-[11px] font-black ${pdv.aberto ? 'text-[#15803D]' : 'text-rose-600'}`}>
                                      {pdv.aberto ? 'Aberto' : 'Fechado'}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Divider */}
                                <div className="h-[1px] bg-[#E7ECF3] w-full mb-3" />
                                
                                {/* Infos */}
                                <div className="space-y-2 mb-3">
                                  <div className="grid grid-cols-2 gap-2">
                                    {/* Operador */}
                                    <div className="bg-[#F8FAFC] rounded-[14px] p-3 flex items-center gap-2">
                                      <User className="w-4 h-4 text-[#533FF6] flex-shrink-0" />
                                      <div className="flex flex-col overflow-hidden">
                                        <span className="text-[10px] font-black text-[#94A3B8] tracking-widest">OPERADOR</span>
                                        <span className="text-[13px] font-black text-[#45556C] truncate">{pdv.usuario}</span>
                                      </div>
                                    </div>
                                    {/* Período */}
                                    <div className="bg-[#F8FAFC] rounded-[14px] p-3 flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-[#533FF6] flex-shrink-0" />
                                      <div className="flex flex-col overflow-hidden">
                                        <span className="text-[10px] font-black text-[#94A3B8] tracking-widest">PERÍODO</span>
                                        <span className="text-[13px] font-black text-[#45556C] truncate">{pdv.descricaoPeriodo}</span>
                                      </div>
                                    </div>
                                  </div>
                                  {/* Abertura */}
                                  <div className="bg-[#F8FAFC] rounded-[14px] p-3 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-[#533FF6] flex-shrink-0" />
                                    <div className="flex flex-col overflow-hidden">
                                      <span className="text-[10px] font-black text-[#94A3B8] tracking-widest">ABERTURA</span>
                                      <span className="text-[13px] font-black text-[#45556C] truncate">{new Date(pdv.createAt).toLocaleString('pt-BR')}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Button */}
                                <button 
                                  onClick={() => {
                                    setSelectedPdvSession(pdv);
                                    setPdvSubView('gestaoPedidos');
                                  }}
                                  className="w-full h-[48px] bg-[#2E8B57] hover:bg-[#27784A] text-white rounded-[16px] font-black text-[15px] transition-all flex items-center justify-center"
                                >
                                  Realizar vendas
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-12 text-center">
                            <h3 className="text-[16px] font-black text-[#1D293D] mb-1">Nenhum caixa aberto encontrado</h3>
                            <p className="text-[13px] text-[#62748E] font-medium">Abra um novo caixa para iniciar as vendas</p>
                          </div>
                        )}
                      </div>

                      {/* Right 1/3: PDV Actions */}
                      <div className="space-y-3">
                        {/* Novo Caixa */}
                        <button 
                          onClick={() => setIsNewPdvModalOpen(true)}
                          className="w-full bg-white border border-[#E7ECF3] rounded-[18px] p-4 flex items-center gap-3 hover:shadow-md transition-all text-left"
                        >
                          <div className="bg-[#ECFDF5] p-2.5 rounded-[14px] flex-shrink-0">
                            <Plus className="w-5 h-5 text-[#15803D]" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <h4 className="text-[15px] font-black text-[#1D293D]">Novo caixa</h4>
                            <p className="text-[13px] text-[#62748E] font-medium truncate">Abra um caixa para realizar vendas</p>
                          </div>
                          <ChevronRight className="w-6 h-6 text-[#94A3B8] flex-shrink-0" />
                        </button>

                        {/* Usuários PDV */}
                        <button 
                          onClick={() => {
                            setCurrentView('people');
                            setPeopleSubView('posUsers');
                          }}
                          className="w-full bg-white border border-[#E7ECF3] rounded-[18px] p-4 flex items-center gap-3 hover:shadow-md transition-all text-left"
                        >
                          <div className="bg-[#EFF6FF] p-2.5 rounded-[14px] flex-shrink-0">
                            <User className="w-5 h-5 text-[#3B82F6]" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <h4 className="text-[15px] font-black text-[#1D293D]">Usuários ponto de venda</h4>
                            <p className="text-[13px] text-[#62748E] font-medium truncate">Gerencie usuários e acessos ao caixa</p>
                          </div>
                          <ChevronRight className="w-6 h-6 text-[#94A3B8] flex-shrink-0" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {pdvSubView === 'gestaoPedidos' && (
                  <div className="flex flex-col h-full bg-[#F8F9FA] relative">
                    <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-24 sm:pb-8">
                      <div className="max-w-[1600px] mx-auto space-y-6">
                        
                        {/* Header Info */}
                        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 pt-2">
                          <div className="flex flex-col items-center sm:items-start space-y-2">
                            <h2 className="text-[18px] font-black text-[#1D293D] font-montserrat">
                              {selectedPdvSession?.filialPdv || 'Ponto de Venda'}
                            </h2>
                            <div className="bg-white border border-[#45556C]/10 rounded-[40px] p-2.5 shadow-[0_10px_18px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                              {/* Chips */}
                              <div className="flex items-center gap-1.5 bg-[#F8FAFC] px-3 py-1.5 rounded-full">
                                <Clock className="w-4 h-4 text-[#533FF6]" />
                                <span className="text-[12px] font-bold text-[#45556C]">{selectedPdvSession?.descricaoPeriodo || 'Período'}</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-[#F8FAFC] px-3 py-1.5 rounded-full">
                                <Calendar className="w-4 h-4 text-[#533FF6]" />
                                <span className="text-[12px] font-bold text-[#45556C]">
                                  {selectedPdvSession ? new Date(selectedPdvSession.createAt).toLocaleString('pt-BR') : ''}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-[#F8FAFC] px-3 py-1.5 rounded-full">
                                <User className="w-4 h-4 text-[#533FF6]" />
                                <span className="text-[12px] font-bold text-[#45556C]">{selectedPdvSession?.usuario || 'Usuário'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Desktop Novo Pedido Button */}
                          <div className="hidden sm:block">
                            <button
                              onClick={() => setPdvSubView('novoPedido')}
                              className="bg-[#2E8B57] text-white h-[50px] px-6 rounded-[16px] text-[16px] font-medium shadow-[0_8px_16px_rgba(46,139,87,0.2)] hover:bg-[#27784A] transition-all flex items-center justify-center gap-2"
                            >
                              + Novo Pedido
                            </button>
                          </div>
                        </div>

                        {/* Search and Tabs Container */}
                        <div className="flex flex-col space-y-4">
                          {/* Search */}
                          <div className="bg-white border border-[#E7ECF3] rounded-[24px] p-2 flex items-center shadow-[0_6px_12px_rgba(0,0,0,0.02)]">
                            <div className="pl-3 pr-2">
                              <Search className="w-5 h-5 text-[#94A3B8]" />
                            </div>
                            <input
                              type="text"
                              placeholder="Buscar por número do pedido..."
                              value={orderSearch}
                              onChange={(e) => setOrderSearch(e.target.value)}
                              className="flex-1 bg-transparent border-none text-[14px] font-medium text-[#1D293D] placeholder-[#94A3B8] focus:ring-0 outline-none"
                            />
                          </div>

                          {/* Tabs */}
                          <div className="bg-[#F8FAFC] p-1 rounded-[34px] flex w-full overflow-x-auto hide-scrollbar">
                            {['Todos', 'Abertos', 'Finalizados', 'Cancelados'].map((filter) => (
                              <button
                                key={filter}
                                onClick={() => setOrderFilter(filter as any)}
                                className={`flex-1 min-w-[100px] py-2.5 px-4 rounded-[24px] text-[14px] font-black transition-all ${
                                  orderFilter === filter 
                                    ? 'bg-white text-[#533FF6] border border-[#EEF2F7] shadow-[0_6px_14px_rgba(0,0,0,0.05)]' 
                                    : 'text-[#7E8DA1] hover:text-[#533FF6] bg-transparent'
                                }`}
                              >
                                {filter}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Orders List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {orderLoading ? (
                            <div className="col-span-full py-12 text-center text-slate-400 font-medium">Carregando pedidos...</div>
                          ) : (() => {
                            const filteredPedidos = pedidos.filter(p => {
                              if (orderFilter === 'Abertos') return !p.finalizado && !p.cancelado;
                              if (orderFilter === 'Finalizados') return p.finalizado && !p.cancelado;
                              if (orderFilter === 'Cancelados') return p.cancelado;
                              return true;
                            }).filter(p => {
                              if (!orderSearch) return true;
                              return p.numeroPedido?.toString().includes(orderSearch);
                            });

                            if (filteredPedidos.length === 0) {
                              return <div className="col-span-full py-12 text-center text-slate-400 font-medium">Nenhum pedido encontrado para este filtro.</div>;
                            }

                            return filteredPedidos.map((pedido) => (
                            <div 
                              key={pedido.id} 
                              onClick={() => {
                                setSelectedOrder(pedido);
                                setPdvSubView('orderDetails');
                              }}
                              className="bg-white border border-[#E7ECF3] rounded-[22px] p-4 shadow-[0_8px_18px_rgba(0,0,0,0.04)] cursor-pointer hover:shadow-md transition-all"
                            >
                              {/* Top */}
                              <div className="flex justify-between items-start mb-3.5">
                                <div className="space-y-2">
                                  <h3 className="text-[17px] font-black text-[#1D293D]">Pedido #{pedido.numeroPedido}</h3>
                                  <div className="inline-block bg-[#F3F0FF] px-2.5 py-1 rounded-[14px]">
                                    <span className="text-[11px] font-black text-[#533FF6]">{pedido.nomeCategoriaPreco || '-'}</span>
                                  </div>
                                </div>
                                <div className={`px-2.5 py-1 rounded-[14px] ${
                                  pedido.cancelado ? 'bg-[#FEF2F2]' : 
                                  pedido.finalizado ? 'bg-[#DBEAFE]' : 'bg-[#ECFDF5]'
                                }`}>
                                  <span className={`text-[11px] font-black ${
                                    pedido.cancelado ? 'text-rose-600' : 
                                    pedido.finalizado ? 'text-[#372AAC]' : 'text-[#15803D]'
                                  }`}>
                                    {pedido.cancelado ? 'Cancelado' : pedido.finalizado ? 'Finalizado' : 'Aberto'}
                                  </span>
                                </div>
                              </div>

                              {/* Divider */}
                              <div className="h-[1px] bg-[#EEF2F7] w-full mb-3.5" />

                              {/* Content */}
                              <div className="flex justify-between items-center">
                                <div className="space-y-2.5">
                                  {/* Abertura */}
                                  <div className="flex items-center gap-2">
                                    <div className="bg-[#F8FAFC] p-2 rounded-[12px]">
                                      <Calendar className="w-4 h-4 text-[#533FF6]" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-black text-[#94A3B8]">ABERTURA</span>
                                      <span className="text-[13px] font-black text-[#45556C]">{new Date(pedido.abertura).toLocaleString('pt-BR')}</span>
                                    </div>
                                  </div>
                                  {/* Operador */}
                                  <div className="flex items-center gap-2">
                                    <div className="bg-[#F8FAFC] p-2 rounded-[12px]">
                                      <User className="w-4 h-4 text-[#533FF6]" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-black text-[#94A3B8]">OPERADOR</span>
                                      <span className="text-[13px] font-black text-[#45556C] truncate max-w-[120px]">{pedido.nomeUsuarioRegistro || '-'}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Total */}
                                <div className="flex flex-col items-end justify-center">
                                  <span className="text-[10px] font-black text-[#94A3B8] tracking-wider">TOTAL</span>
                                  <span className="text-[19px] font-black text-[#1D293D]">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.totalPedido)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            ));
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Fixed Bottom Button on Mobile ONLY */}
                    <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA] to-transparent z-10">
                      <button
                        onClick={() => setPdvSubView('novoPedido')}
                        className="w-full bg-[#2E8B57] text-white h-[60px] px-8 rounded-[20px] text-[20px] font-medium shadow-[0_10px_18px_rgba(46,139,87,0.2)] hover:bg-[#27784A] transition-all flex items-center justify-center gap-2"
                      >
                        + Novo Pedido
                      </button>
                    </div>
                  </div>
                )}

                {pdvSubView === 'novoPedido' && (
                  <div className="flex flex-col h-full bg-[#F8F9FA] relative">
                    <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                      <div className="max-w-3xl mx-auto space-y-4">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between mb-2">
                          <button 
                            onClick={() => setPdvSubView('gestaoPedidos')}
                            className="w-[42px] h-[42px] bg-white border border-[#E7ECF3] rounded-[14px] flex items-center justify-center shadow-[0_6px_12px_rgba(0,0,0,0.04)] hover:bg-slate-50 transition-colors"
                          >
                            <ArrowLeft className="w-5 h-5 text-[#45556C]" />
                          </button>
                          
                          <div className="flex flex-col items-center">
                            <h2 className="text-[20px] font-black text-[#1D293D] font-montserrat">Gerar Novo Pedido</h2>
                            <p className="text-[12px] text-[#94A3B8] font-medium">Identifique o pedido e selecione a categoria de preço</p>
                          </div>
                          
                          <div className="w-[42px]" /> {/* Spacer for balance */}
                        </div>

                        {/* Card Identificação */}
                        <div className="bg-white border border-[#E7ECF3] rounded-[24px] p-4 shadow-[0_10px_18px_rgba(0,0,0,0.04)]">
                          <div className="space-y-1 mb-3">
                            <h3 className="text-[16px] font-black text-[#1D293D]">Identificação do Pedido</h3>
                            <p className="text-[12px] text-[#94A3B8]">Informe o número do pedido ou o nome do cliente</p>
                          </div>
                          
                          <div className="bg-[#F8FAFC] border border-[#E7ECF3] rounded-[18px] p-3 flex items-center gap-3">
                            <div className="w-[34px] h-[34px] bg-[#F3F0FF] rounded-[12px] flex items-center justify-center flex-shrink-0">
                              <ShoppingBag className="w-4 h-4 text-[#533FF6]" />
                            </div>
                            <input
                              type="text"
                              value={newOrderMesaCliente}
                              onChange={(e) => setNewOrderMesaCliente(e.target.value)}
                              placeholder="Digite número ou nome do cliente"
                              className="flex-1 bg-transparent border-none text-[14px] font-black text-[#1D293D] placeholder-[#94A3B8] focus:ring-0 outline-none"
                            />
                          </div>
                        </div>

                        {/* Lista de Categorias */}
                        <div className="space-y-3 pt-2">
                          {priceCategories.map((cat) => (
                            <div 
                              key={cat.id}
                              className="bg-white border border-[#E7ECF3] rounded-[22px] p-4 shadow-[0_8px_18px_rgba(0,0,0,0.04)] flex items-center gap-3.5"
                            >
                              <div className="w-[46px] h-[46px] bg-[#F3F0FF] rounded-[14px] flex items-center justify-center flex-shrink-0">
                                <ShoppingBag className="w-5 h-5 text-[#533FF6]" />
                              </div>
                              
                              <div className="flex-1 flex flex-col justify-center">
                                <h4 className="text-[16px] font-black text-[#1D293D] truncate">{cat.categoriaPreco}</h4>
                                <p className="text-[12px] text-[#94A3B8] truncate">Toque para selecionar esta categoria</p>
                              </div>
                              
                              <button
                                onClick={() => {
                                  setSelectedPriceCategoryId(cat.id);
                                  handleCreateOrder();
                                }}
                                disabled={orderLoading}
                                className="bg-[#F8FAFC] border border-[#E7ECF3] rounded-[14px] px-3 py-2 hover:bg-[#EEF2F7] transition-colors flex-shrink-0"
                              >
                                <span className="text-[11px] font-black text-[#45556C]">
                                  {orderLoading && selectedPriceCategoryId === cat.id ? 'Gerando...' : 'Selecionar'}
                                </span>
                              </button>
                            </div>
                          ))}

                          {priceCategories.length === 0 && (
                            <div className="bg-white border border-[#E7ECF3] rounded-[22px] p-6 shadow-[0_6px_16px_rgba(0,0,0,0.03)] flex flex-col items-center text-center mt-2">
                              <div className="w-[52px] h-[52px] bg-[#F3F0FF] rounded-[18px] flex items-center justify-center mb-3">
                                <ShoppingBag className="w-6 h-6 text-[#533FF6]" />
                              </div>
                              <h4 className="text-[15px] font-black text-[#1D293D] mb-1">Nenhuma categoria encontrada</h4>
                              <p className="text-[12px] text-[#94A3B8]">Verifique se existem categorias disponíveis para gerar pedidos.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {pdvSubView === 'orderDetails' && selectedOrder && (
                  <div className="max-w-[1600px] mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Product Selection */}
                    <div className="lg:col-span-8 space-y-8">
                      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full sm:w-96">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Buscar produto..."
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                          />
                        </div>
                        <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto">
                          {['Todos', ...new Set(productsWithPrices.map(p => p.categoriaProduto))].map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setSelectedCategory(cat)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                selectedCategory === cat ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                        {loadingProducts ? (
                          <div className="col-span-full py-12 text-center text-slate-400 font-medium">Carregando produtos...</div>
                        ) : productsWithPrices.length === 0 ? (
                          <div className="col-span-full py-12 text-center text-slate-400 font-medium">Nenhum produto encontrado para esta categoria de preço.</div>
                        ) : productsWithPrices
                          .filter(p => selectedCategory === 'Todos' || p.categoriaProduto === selectedCategory)
                          .filter(p => p.nomeProduto.toLowerCase().includes(productSearch.toLowerCase()))
                          .map((product) => (
                          <motion.button
                            key={product.id}
                            whileHover={{ y: -4 }}
                            onClick={() => handleAddItemToOrder(product)}
                            className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all text-left group flex flex-col h-full"
                          >
                            <div className="w-full aspect-square bg-slate-50 rounded-2xl mb-4 flex items-center justify-center group-hover:bg-indigo-50 transition-colors overflow-hidden">
                              <Package className="w-8 h-8 text-slate-300 group-hover:text-indigo-600" />
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2 flex-grow">{product.nomeProduto}</h4>
                            <p className="text-xs text-slate-400 font-medium mb-3">{product.categoriaProduto}</p>
                            <div className="flex items-center justify-between mt-auto">
                              <span className="font-black text-indigo-600">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.precoProduto)}
                              </span>
                              <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <Plus className="w-4 h-4" />
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-4">
                      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col sticky top-8 max-h-[calc(100vh-8rem)] overflow-hidden">
                        <div className="p-6 border-bottom border-slate-50 bg-slate-50/50">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-black text-slate-800">Resumo do Pedido</h3>
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-black">#{selectedOrder.numeroPedido}</span>
                          </div>
                          <p className="text-sm text-slate-500 font-medium">{selectedOrder.nomeCategoriaPreco || 'Balcão'}</p>
                        </div>

                        <div className="flex-grow overflow-y-auto p-6 space-y-4">
                          {selectedOrder.itensPedido && selectedOrder.itensPedido.length > 0 ? (
                            selectedOrder.itensPedido.filter(item => !item.itemPedidoCancelado).map((item) => (
                              <div key={item.idItemPedido} className="flex items-center gap-4 group">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 font-black text-xs">
                                  {item.quantidade}x
                                </div>
                                <div className="flex-grow">
                                  <h5 className="text-sm font-bold text-slate-700 line-clamp-1">{item.nomeProduto}</h5>
                                  <p className="text-xs text-slate-400 font-medium">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco)} cada
                                  </p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                  <span className="text-sm font-black text-slate-800">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.totalItem)}
                                  </span>
                                  <button 
                                    onClick={() => handleRemoveItemFromOrder(item.idItemPedido)}
                                    className="p-1 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-12">
                              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <ShoppingBag className="w-8 h-8" />
                              </div>
                              <p className="text-slate-400 font-medium">Nenhum item adicionado</p>
                            </div>
                          )}
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-6">
                          <div className="space-y-2">
                            <div className="flex justify-between text-slate-500 text-sm font-medium">
                              <span>Subtotal</span>
                              <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedOrder.totalPedido)}</span>
                            </div>
                            <div className="flex justify-between text-slate-800 text-xl font-black pt-2 border-t border-slate-200">
                              <span>Total</span>
                              <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedOrder.totalPedido)}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <button 
                              onClick={() => handleCancelPedido()}
                              className="py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all flex items-center justify-center gap-2"
                            >
                              <XCircle className="w-5 h-5" />
                              Cancelar
                            </button>
                            <button 
                              onClick={() => setPdvSubView('payment')}
                              disabled={!selectedOrder.itens || selectedOrder.itens.length === 0}
                              className="py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CreditCard className="w-5 h-5" />
                              Pagamento
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {pdvSubView === 'payment' && selectedOrder && (
                  <div className="max-w-[1600px] mx-auto p-4 sm:p-8 flex items-center justify-center min-h-[60vh]">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white p-8 sm:p-12 rounded-[3rem] shadow-xl border border-slate-100 w-full max-w-4xl"
                    >
                      <div className="flex flex-col md:flex-row gap-12">
                        <div className="flex-1 space-y-8">
                          <div className="flex items-center gap-6">
                            <div className="p-5 bg-emerald-50 rounded-3xl text-emerald-600">
                              <CreditCard className="w-8 h-8" />
                            </div>
                            <div>
                              <h2 className="text-3xl font-black text-slate-800">Pagamento</h2>
                              <p className="text-slate-400 font-medium">Finalize o pedido #{selectedOrder.numeroPedido}</p>
                            </div>
                          </div>

                          <div className="bg-slate-50 p-8 rounded-[2rem] space-y-4">
                            <div className="flex justify-between text-slate-500 font-bold uppercase tracking-widest text-xs">
                              <span>Valor Total</span>
                              <span>{selectedOrder.nomeCategoriaPreco || 'Balcão'}</span>
                            </div>
                            <div className="text-5xl font-black text-slate-800">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedOrder.totalPedido)}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { id: 'dinheiro', label: 'Dinheiro', icon: Banknote },
                              { id: 'cartao', label: 'Cartão', icon: CreditCard },
                              { id: 'pix', label: 'PIX', icon: QrCode },
                              { id: 'outros', label: 'Outros', icon: Package },
                            ].map((method) => (
                              <button
                                key={method.id}
                                className="p-6 bg-white border-2 border-slate-100 rounded-3xl flex flex-col items-center gap-4 hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
                              >
                                <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-white group-hover:text-indigo-600 transition-all">
                                  <method.icon className="w-8 h-8" />
                                </div>
                                <span className="font-black text-slate-600 group-hover:text-indigo-600">{method.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="w-full md:w-80 space-y-6">
                          <div className="bg-slate-900 text-white p-8 rounded-[2rem] space-y-6">
                            <h4 className="font-bold text-slate-400 uppercase tracking-widest text-xs">Resumo</h4>
                            <div className="space-y-4">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Itens</span>
                                <span className="font-bold">{selectedOrder.itens?.length || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Desconto</span>
                                <span className="font-bold">R$ 0,00</span>
                              </div>
                              <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
                                <span className="text-slate-400">Total</span>
                                <span className="text-2xl font-black text-emerald-400">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedOrder.totalPedido)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button 
                            onClick={() => {
                              toast.success('Funcionalidade de pagamento em desenvolvimento');
                              setPdvSubView('gestaoPedidos');
                            }}
                            className="w-full py-6 bg-emerald-500 text-white rounded-[2rem] font-black text-lg shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3"
                          >
                            <CheckCircle2 className="w-6 h-6" />
                            Finalizar Venda
                          </button>
                          <button 
                            onClick={() => setPdvSubView('orderDetails')}
                            className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-all"
                          >
                            Voltar para o pedido
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
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
                    {/* Desktop Table */}
                    <div className="hidden sm:block overflow-x-auto">
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

                    {/* Mobile Card List */}
                    <div className="sm:hidden divide-y divide-slate-100">
                      {filteredPriceCategories.map((priceCategory) => (
                        <div key={priceCategory.id} className="p-4 flex items-center justify-between">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-black text-slate-800">{priceCategory.categoriaPreco}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Status:</span>
                              {priceCategory.habilitado ? (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black uppercase tracking-wider">Habilitado</span>
                              ) : (
                                <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md text-[9px] font-black uppercase tracking-wider">Desabilitado</span>
                              )}
                            </div>
                          </div>
                          <button 
                            onClick={() => openEditPriceCategory(priceCategory)}
                            className="p-2.5 bg-slate-50 text-slate-600 rounded-xl"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
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
                    {/* Desktop Table */}
                    <div className="hidden sm:block overflow-x-auto">
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

                    {/* Mobile Card List */}
                    <div className="sm:hidden divide-y divide-slate-100">
                      {filteredProductsList.map((product) => (
                        <div key={product.id} className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-800">{product.nomeProduto}</span>
                              <span className="text-[10px] font-mono text-slate-400">{product.codigoProduto}</span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[9px] font-black uppercase tracking-wider">{product.categoriaProduto}</span>
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black uppercase tracking-wider">{product.unidadeMedidaProduto}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button 
                              onClick={() => openEditProduct(product)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Editar
                            </button>
                            <button 
                              onClick={() => openAssignPriceModal(product)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold"
                            >
                              <Tag className="w-3.5 h-3.5" />
                              Preços
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {filteredProductsList.length === 0 && (
                      <div className="px-6 py-10 text-center text-slate-400">
                        Nenhum produto encontrado.
                      </div>
                    )}
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
                    {/* Desktop Table */}
                    <div className="hidden sm:block overflow-x-auto">
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

                    {/* Mobile Card List */}
                    <div className="sm:hidden divide-y divide-slate-100">
                      {filteredProductPrices.map((productPrice) => (
                        <div key={productPrice.id} className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-800">{productPrice.nomeProduto}</span>
                              <span className="text-[10px] font-mono text-slate-400">{productPrice.codigoProduto}</span>
                            </div>
                            <span className="text-sm font-black text-indigo-600">
                              {productPrice.precoProduto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-black uppercase tracking-wider">{productPrice.nomeFilial}</span>
                            <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded-md text-[9px] font-black uppercase tracking-wider">{productPrice.categoriaPreco}</span>
                          </div>

                          <div className="flex justify-end pt-1">
                            <button 
                              onClick={() => openEditProductPrice(productPrice)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Editar Preço
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
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
              ) : productSubView === 'stock' ? (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Controle de Estoque</h2>
                      <p className="text-sm text-slate-500 mt-1">Gerencie as entradas e saídas de produtos.</p>
                    </div>
                    <button className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95">
                      <Plus className="w-5 h-5" />
                      Nova Movimentação
                    </button>
                  </div>
                  <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">Módulo de Estoque</p>
                    <p className="text-sm">Esta funcionalidade estará disponível em breve.</p>
                  </div>
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

      {/* New PDV Modal */}
      <AnimatePresence>
        {isNewPdvModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewPdvModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                <h3 className="text-lg font-bold text-slate-800">Abertura de Caixa</h3>
                <button 
                  onClick={() => setIsNewPdvModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreatePdv} className="p-6 space-y-4 overflow-y-auto">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filial Selecionada</label>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 font-bold flex items-center gap-2">
                    <Store className="w-4 h-4 text-indigo-600" />
                    {selectedBranch?.nomeFilial || 'Nenhuma filial selecionada'}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Operador PDV</label>
                  <select 
                    name="usuarioPdvId"
                    required
                    className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  >
                    <option value="">Selecione um operador...</option>
                    {posUsers.filter(u => u.acessoCaixa).map(u => (
                      <option key={u.usuarioCaixaPdvEntityId} value={u.usuarioCaixaPdvEntityId}>
                        {u.usuarioCaixaPdvEntityNome} ({u.apelidoOperadorCaixa})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Período</label>
                  <select 
                    name="descricaoPeriodo"
                    required
                    className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  >
                    <option value="">Selecione o período...</option>
                    <option value="Almoço">Almoço</option>
                    <option value="Janta">Janta</option>
                    <option value="Dia">Dia</option>
                    <option value="Noite">Noite</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={pdvFormLoading}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {pdvFormLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Confirmar Abertura
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
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

              <form onSubmit={handleSaveProductPrice} className="p-6 space-y-4 overflow-y-auto">
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
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
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

              <form onSubmit={handleSaveProduct} className="p-6 space-y-4 overflow-y-auto">
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
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
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

              <form onSubmit={handleSavePriceCategory} className="p-6 space-y-6 overflow-y-auto">
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
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
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

              <form onSubmit={handleSaveCategory} className="p-6 space-y-6 overflow-y-auto">
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

      {/* POS User Modal */}
      <AnimatePresence>
        {isPosUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPosUserModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                <h3 className="text-lg font-bold text-slate-800">Novo Usuário PDV</h3>
                <button 
                  onClick={() => setIsPosUserModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePosUser} className="p-6 space-y-6 overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selecionar Usuário Vinculado</label>
                  <select 
                    required
                    value={selectedLinkedUserId}
                    onChange={(e) => setSelectedLinkedUserId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  >
                    <option value="">Selecione um usuário...</option>
                    {linkedUsers.map((u) => (
                      <option key={u.idUsuarioVinculado} value={u.idUsuarioVinculado}>
                        {u.nomeUsuarioVinculado} ({u.emailUsuarioVinculado})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Apelido do Operador</label>
                  <input 
                    required
                    value={posUserNickname}
                    onChange={(e) => setPosUserNickname(e.target.value)}
                    placeholder="Ex: Caixa 01, Operador João..."
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Senha Numérica</label>
                  <input 
                    type="number"
                    required
                    value={posUserPassword}
                    onChange={(e) => setPosUserPassword(e.target.value)}
                    placeholder="Ex: 1234"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsPosUserModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-100"
                  >
                    Cadastrar Usuário PDV
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-black text-slate-800 mb-2">{confirmDialog.title}</h3>
              <p className="text-slate-500 mb-8 font-medium">{confirmDialog.message}</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    confirmDialog.onConfirm();
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                  }}
                  className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-8 left-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              toast.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-[#DC143C] border-[#B21031] text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-bold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
