export interface Category {
  id: string;
  clienteId?: string;
  usuarioRegistroId?: string;
  habilitado: boolean;
  createAt?: string;
  updateAt?: string;
  nomeCategoria: string;
}

export interface Product {
  id: string;
  nomeProduto: string;
  codigoProduto: string;
  categoriaProdutoEntityId: string;
  categoriaProduto: string;
  unidadeMedidaProdutoEntityId: string;
  unidadeMedidaProduto: string;
}

export interface UnitOfMeasure {
  id: string;
  nome: string;
  sigla: string;
  descricao: string;
}

export interface Branch {
  id: string;
  nomeFilial: string;
}

export interface PriceCategory {
  id: string;
  categoriaPreco: string;
  habilitado: boolean;
}

export interface ProductPrice {
  id: string;
  produtoEntityId: string;
  codigoProduto: string;
  nomeProduto: string;
  categoriaProdutoEntityId: string;
  categoriaProduto: string;
  filialEntityId: string;
  nomeFilial: string;
  categoriaPrecoProdutoEntityId: string;
  categoriaPreco: string;
  precoProduto: number;
  tipoPrecoProduto: string;
  habilitado: boolean;
}

export interface UsuarioPdv {
  acessoCaixa: boolean;
  usuarioCaixaPdvEntityId: string;
  usuarioCaixaPdvEntityNome: string;
  apelidoOperadorCaixa: string;
  senhaOperadorCaixa: number;
  email: string;
}

export interface LinkedUser {
  clienteId: string;
  clienteNome: string;
  idUsuarioVinculado: string;
  nomeUsuarioVinculado: string;
  emailUsuarioVinculado: string;
  acessoPermitido: boolean;
}

export interface PdvAberto {
  id: string;
  aberto: boolean;
  filialPdvId: string;
  filialPdv: string;
  usuarioPdvId: string;
  usuario: string;
  createAt: string;
  descricao: string;
  descricaoPeriodo: string;
}
