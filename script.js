document.addEventListener('DOMContentLoaded', () => {
    // Banco de dados inicial de produtos (caso o localStorage esteja vazio)
    const produtosIniciais = [
        {
            id: 1,
            name: "Relógio de Luxo Dourado",
            desc: "Relógio à prova d'água com pulseira de aço.",
            price: 249.90,
            category: "Relógios",
            img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"
        },
        {
            id: 2,
            name: "Fone Bluetooth Pro",
            desc: "Cancelamento de ruído e alta durabilidade de bateria.",
            price: 129.90,
            category: "Fones",
            img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
        },
        {
            id: 3,
            name: "Corrente de Prata 925",
            desc: "Corrente com acabamento premium e antialérgica.",
            price: 89.90,
            category: "Correntes",
            img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500"
        },
        {
            id: 4,
            name: "Carregador Turbo 65W",
            desc: "Carregamento ultrarrápido para múltiplos dispositivos.",
            price: 79.90,
            category: "Carregadores",
            img: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"
        }
    ];

    // Carregar produtos do localStorage ou usar os iniciais
    let products = JSON.parse(localStorage.getItem('dhon_products')) || produtosIniciais;
    let cart = JSON.parse(localStorage.getItem('dhon_cart')) || [];
    let currentCategory = null;

    // Seletores de Elementos do DOM
    const drawerOverlay = document.getElementById('drawer-overlay');
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');
    
    const productModal = document.getElementById('product-modal');
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const categoryAddProductBtn = document.getElementById('category-add-product');
    const productForm = document.getElementById('product-form');

    const cartModal = document.getElementById('cart-modal');
    const btnCart = document.getElementById('btn-cart');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    const accountModal = document.getElementById('account-modal');
    const btnAccount = document.getElementById('btn-account');
    const closeAccountBtn = document.getElementById('close-account-btn');

    const productsContainer = document.getElementById('products-container');
    const searchInput = document.getElementById('search-input');
    const categoryView = document.getElementById('category-view');
    const featuredSection = document.getElementById('featured-section');
    const categoryProductsContainer = document.getElementById('category-products-container');
    const categoryTitle = document.getElementById('category-title');
    const categoryCount = document.getElementById('category-count');
    const sectionTitle = document.getElementById('section-title');
    const sectionSubtitle = document.getElementById('section-subtitle');

    const navLinks = document.querySelectorAll('nav a');
    const categoryListItems = document.querySelectorAll('.category-btn');

    // ================================
    // FUNÇÕES DE RENDERIZAÇÃO
    // ================================

    function saveToLocalStorage() {
        localStorage.setItem('dhon_products', JSON.stringify(products));
        localStorage.setItem('dhon_cart', JSON.stringify(cart));
    }

    function renderProducts(lista, container) {
        if (!container) return;
        container.innerHTML = '';

        if (lista.length === 0) {
            container.innerHTML = `
                <div class="empty-products" style="grid-column: 1 / -1;">
                    <i class="fa-solid fa-box-open"></i>
                    Nenhum produto encontrado.
                </div>
            `;
            return;
        }

        lista.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            const parcelamento = (product.price / 3).toFixed(2).replace('.', ',');

            card.innerHTML = `
                <div>
                    <img src="${product.img}" alt="${product.name}" class="product-img" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'">
                    <span class="product-category">${product.category}</span>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p>${product.desc}</p>
                    </div>
                </div>
                <div>
                    <div class="product-price-box">
                        <div>
                            <span class="product-price">R$ ${Number(product.price).toFixed(2).replace('.', ',')}</span>
                            <span class="product-installment">3x de R$ ${parcelamento} sem juros</span>
                        </div>
                        <button class="btn-buy" data-id="${product.id}" title="Adicionar ao Carrinho">
                            <i class="fa-solid fa-bag-shopping"></i>
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // Adicionar eventos aos botões de compra dos produtos gerados
        container.querySelectorAll('.btn-buy').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = Number(e.currentTarget.getAttribute('data-id'));
                addToCart(id);
            });
        });
    }

    function renderCart() {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-products">
                    <i class="fa-solid fa-bag-shopping"></i>
                    Seu carrinho está vazio.
                </div>
            `;
            if (cartTotal) cartTotal.textContent = 'R$ 0,00';
            if (cartCount) cartCount.textContent = '0';
            return;
        }

        let totalItens = 0;

        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            totalItens += item.quantity;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.img}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <span>R$ ${Number(item.price).toFixed(2).replace('.', ',')} (x${item.quantity})</span>
                </div>
                <button class="cart-remove" data-index="${index}" title="Remover item">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
            cartItemsContainer.appendChild(cartItem);
        });

        if (cartCount) cartCount.textContent = totalItens;
        if (cartTotal) cartTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

        // Eventos para remover itens do carrinho
        cartItemsContainer.querySelectorAll('.cart-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = Number(e.currentTarget.getAttribute('data-index'));
                cart.splice(index, 1);
                saveToLocalStorage();
                renderCart();
            });
        });
    }

    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        saveToLocalStorage();
        renderCart();
        
        if (cartModal) cartModal.classList.add('open');
    }

    // ================================
    // EVENTOS DE NAVEGAÇÃO E MODAIS
    // ================================

    if (menuToggleBtn) menuToggleBtn.addEventListener('click', () => drawerOverlay.classList.add('open'));
    if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', () => drawerOverlay.classList.remove('open'));
    if (drawerOverlay) {
        drawerOverlay.addEventListener('click', (e) => {
            if (e.target === drawerOverlay) drawerOverlay.classList.remove('open');
        });
    }

    if (openModalBtn) openModalBtn.addEventListener('click', () => productModal.classList.add('open'));
    if (categoryAddProductBtn) categoryAddProductBtn.addEventListener('click', () => productModal.classList.add('open'));
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => productModal.classList.remove('open'));
    if (productModal) {
        productModal.addEventListener('click', (e) => {
            if (e.target === productModal) productModal.classList.remove('open');
        });
    }

    if (btnCart) {
        btnCart.addEventListener('click', () => {
            renderCart();
            if (cartModal) cartModal.classList.add('open');
        });
    }
    if (closeCartBtn) closeCartBtn.addEventListener('click', () => cartModal.classList.remove('open'));
    if (cartModal) {
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) cartModal.classList.remove('open');
        });
    }

    if (btnAccount) btnAccount.addEventListener('click', () => accountModal.classList.add('open'));
    if (closeAccountBtn) closeAccountBtn.addEventListener('click', () => accountModal.classList.remove('open'));
    if (accountModal) {
        accountModal.addEventListener('click', (e) => {
            if (e.target === accountModal) accountModal.classList.remove('open');
        });
    }

    // Finalizar Compra via WhatsApp (Direciona para o chat)
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Seu carrinho está vazio!');
                return;
            }
            let mensagem = "Olá! Gostaria de finalizar o seguinte pedido na Dhon Imports:%0A";
            let total = 0;
            cart.forEach(item => {
                mensagem += `- ${item.quantity}x ${item.name} (R$ ${(item.price * item.quantity).toFixed(2)})%0A`;
                total += item.price * item.quantity;
            });
            mensagem += `%0A*Total: R$ ${total.toFixed(2)}*`;
            
            const numeroWhatsApp = "5561996210117"; 
            window.open(`https://wa.me/${numeroWhatsApp}?text=${mensagem}`, '_blank');
        });
    }

    // ================================
    // CADASTRO DE NOVO PRODUTO (CORRIGIDO E ROBUSTO)
    // ================================
    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nomeInput = document.getElementById('prod-name').value;
            const precoInput = document.getElementById('prod-price').value;
            const catInput = document.getElementById('prod-category').value;
            const descInput = document.getElementById('prod-desc').value;
            const imgInput = document.getElementById('prod-img').value;

            if (!nomeInput || !precoInput || !catInput) {
                alert('Por favor, preencha os campos obrigatórios (Nome, Preço e Categoria).');
                return;
            }

            const newProduct = {
                id: Date.now(),
                category: catInput,
                name: nomeInput,
                desc: descInput || '',
                price: parseFloat(precoInput),
                img: imgInput || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'
            };

            products.push(newProduct);
            saveToLocalStorage();
            
            if (currentCategory) {
                filtrarPorCategoria(currentCategory);
            } else {
                renderProducts(products, productsContainer);
            }

            productForm.reset();
            
            if (productModal) {
                productModal.classList.remove('open');
                productModal.style.display = ''; // Limpa qualquer alteração manual de estilo
            }

            alert('Produto cadastrado e salvo com sucesso!');
        });
    }

    // ================================
    // BUSCA E FILTROS
    // ================================
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase();
            const filtrados = products.filter(p => 
                p.name.toLowerCase().includes(termo) || 
                p.desc.toLowerCase().includes(termo) || 
                p.category.toLowerCase().includes(termo)
            );

            if (currentCategory) {
                const catFiltrados = filtrados.filter(p => p.category === currentCategory);
                renderProducts(catFiltrados, categoryProductsContainer);
                if (categoryCount) categoryCount.textContent = `${catFiltrados.length} produtos`;
            } else {
                if (sectionTitle) sectionTitle.textContent = "RESULTADOS DA BUSCA";
                if (sectionSubtitle) sectionSubtitle.textContent = `Termo: "${e.target.value}"`;
                renderProducts(filtrados, productsContainer);
            }
        });
    }

    function filtrarPorCategoria(catNome) {
        currentCategory = catNome;
        if (drawerOverlay) drawerOverlay.classList.remove('open');

        if (featuredSection) featuredSection.style.display = 'none';
        if (categoryView) categoryView.classList.add('active');

        if (categoryTitle) categoryTitle.textContent = catNome.toUpperCase();
        const produtosDaCat = products.filter(p => p.category === catNome);
        if (categoryCount) categoryCount.textContent = `${produtosDaCat.length} produtos`;
        
        renderProducts(produtosDaCat, categoryProductsContainer);
    }

    categoryListItems.forEach(li => {
        li.addEventListener('click', () => {
            categoryListItems.forEach(item => item.classList.remove('active'));
            li.classList.add('active');
            const catNome = li.getAttribute('data-category');
            filtrarPorCategoria(catNome);
        });
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const navType = link.getAttribute('data-nav');

            if (navType === 'inicio') {
                currentCategory = null;
                if (categoryView) categoryView.classList.remove('active');
                if (featuredSection) featuredSection.style.display = 'block';
                if (sectionTitle) sectionTitle.textContent = "DESTAQUES";
                if (sectionSubtitle) sectionSubtitle.textContent = "Produtos disponíveis na loja";
                renderProducts(products, productsContainer);
            } else if (navType === 'categorias') {
                if (drawerOverlay) drawerOverlay.classList.add('open');
            } else if (navType === 'ofertas' || navType === 'lancamentos') {
                currentCategory = null;
                if (categoryView) categoryView.classList.remove('active');
                if (featuredSection) featuredSection.style.display = 'block';
                if (sectionTitle) sectionTitle.textContent = navType === 'ofertas' ? "OFERTAS ESPECIAIS" : "ÚLTIMOS LANÇAMENTOS";
                if (sectionSubtitle) sectionSubtitle.textContent = "Confira os itens em destaque";
                renderProducts(products, productsContainer);
            } else if (navType === 'contato') {
                window.open(`https://wa.me/5561996210117?text=Olá! Gostaria de tirar uma dúvida.`, '_blank');
            } else if (navType === 'rastrear') {
                alert('Digite o código de rastreio na aba de atendimento (Em breve).');
            }
        });
    });

    // Inicialização da página
    renderProducts(products, productsContainer);
    renderCart();
});
