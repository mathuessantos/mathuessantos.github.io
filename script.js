class PortfolioApp {
    constructor() {
        this.config = {
            particulasAtivas: false,
            mouseEfeitoAtivo: false,
            temaEscuro: true,
            rastroMouse: [],
            particles: [],
            animationId: null
        };
        
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.inicializarTema();
            this.inicializarControles();
            this.inicializarEfeitoDigitacao();
            this.inicializarScrollEffects();
            this.inicializarFormulario();
            this.inicializarNavegacao();
        });
    }

    inicializarTema() {
        const temaSalvo = localStorage.getItem('tema');
        if (temaSalvo === 'claro') {
            this.alternarTema();
        }
    }

    alternarTema() {
        this.config.temaEscuro = !this.config.temaEscuro;
        document.documentElement.setAttribute('data-tema', 
            this.config.temaEscuro ? 'escuro' : 'claro'
        );
        
        const icon = document.querySelector('#toggleTema i');
        if (icon) {
            icon.className = this.config.temaEscuro ? 'fas fa-moon' : 'fas fa-sun';
        }
        
        localStorage.setItem('tema', this.config.temaEscuro ? 'escuro' : 'claro');
        
        if (this.config.particulasAtivas) {
            this.pararParticulas();
            setTimeout(() => this.iniciarParticulas(), 100);
        }
    }

    inicializarControles() {
        const toggleTema = document.getElementById('toggleTema');
        if (toggleTema) {
            toggleTema.addEventListener('click', () => this.alternarTema());
        }
        
        const toggleParticulas = document.getElementById('toggleParticulas');
        if (toggleParticulas) {
            toggleParticulas.addEventListener('click', () => {
                this.config.particulasAtivas = !this.config.particulasAtivas;
                toggleParticulas.classList.toggle('ativo', this.config.particulasAtivas);
                
                if (this.config.particulasAtivas) {
                    this.iniciarParticulas();
                } else {
                    this.pararParticulas();
                }
            });
        }
        
        const toggleMouse = document.getElementById('toggleMouse');
        if (toggleMouse) {
            toggleMouse.addEventListener('click', () => {
                this.config.mouseEfeitoAtivo = !this.config.mouseEfeitoAtivo;
                toggleMouse.classList.toggle('ativo', this.config.mouseEfeitoAtivo);
                
                if (this.config.mouseEfeitoAtivo) {
                    this.iniciarEfeitoMouse();
                } else {
                    this.pararEfeitoMouse();
                }
            });
        }
    }

    iniciarParticulas() {
        const canvas = document.getElementById('particlesCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        canvas.classList.add('ativo');
        
        class Particle {
            constructor() {
                this.reset();
            }
            
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 1;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
                this.color = this.config.temaEscuro ? 
                    `rgba(15, 204, 206, ${Math.random() * 0.5})` :
                    `rgba(37, 99, 235, ${Math.random() * 0.5})`;
                this.alpha = Math.random() * 0.5 + 0.2;
            }
            
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                
                if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
                if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
                
                this.alpha -= 0.002;
                if (this.alpha <= 0) {
                    this.reset();
                }
            }
            
            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
        
        this.config.particles = [];
        for (let i = 0; i < 50; i++) {
            this.config.particles.push(new Particle());
        }
        
        const animate = () => {
            if (!this.config.particulasAtivas) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const gradient = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
            );
            
            if (this.config.temaEscuro) {
                gradient.addColorStop(0, 'rgba(26, 26, 46, 0.1)');
                gradient.addColorStop(1, 'rgba(15, 204, 206, 0.05)');
            } else {
                gradient.addColorStop(0, 'rgba(240, 242, 245, 0.1)');
                gradient.addColorStop(1, 'rgba(37, 99, 235, 0.05)');
            }
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            this.config.particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            ctx.strokeStyle = this.config.temaEscuro ? 
                'rgba(15, 204, 206, 0.1)' : 
                'rgba(37, 99, 235, 0.1)';
            ctx.lineWidth = 0.5;
            
            for (let i = 0; i < this.config.particles.length; i++) {
                for (let j = i + 1; j < this.config.particles.length; j++) {
                    const dx = this.config.particles[i].x - this.config.particles[j].x;
                    const dy = this.config.particles[i].y - this.config.particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.moveTo(this.config.particles[i].x, this.config.particles[i].y);
                        ctx.lineTo(this.config.particles[j].x, this.config.particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            
            this.config.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }

    pararParticulas() {
        const canvas = document.getElementById('particlesCanvas');
        if (canvas) {
            canvas.classList.remove('ativo');
        }
        
        if (this.config.animationId) {
            cancelAnimationFrame(this.config.animationId);
            this.config.animationId = null;
        }
    }

    iniciarEfeitoMouse() {
        const efeito = document.createElement('div');
        efeito.className = 'efeito-mouse ativo';
        document.body.appendChild(efeito);
        
        for (let i = 0; i < 10; i++) {
            const rastro = document.createElement('div');
            rastro.className = 'rastro-mouse';
            document.body.appendChild(rastro);
            this.config.rastroMouse.push({
                element: rastro,
                x: 0,
                y: 0,
                timer: null
            });
        }
        
        this.mouseMoveHandler = (e) => {
            efeito.style.left = (e.clientX - 10) + 'px';
            efeito.style.top = (e.clientY - 10) + 'px';
            
            this.config.rastroMouse.forEach((rastro, index) => {
                clearTimeout(rastro.timer);
                
                rastro.timer = setTimeout(() => {
                    rastro.element.style.left = (e.clientX - 3) + 'px';
                    rastro.element.style.top = (e.clientY - 3) + 'px';
                    rastro.element.style.opacity = '0.3';
                    
                    setTimeout(() => {
                        rastro.element.style.opacity = '0';
                    }, 100);
                }, index * 50);
            });
        };
        
        document.addEventListener('mousemove', this.mouseMoveHandler);
    }

    pararEfeitoMouse() {
        const efeito = document.querySelector('.efeito-mouse');
        if (efeito) efeito.remove();
        
        this.config.rastroMouse.forEach(rastro => {
            if (rastro.element) rastro.element.remove();
            if (rastro.timer) clearTimeout(rastro.timer);
        });
        this.config.rastroMouse = [];
        
        if (this.mouseMoveHandler) {
            document.removeEventListener('mousemove', this.mouseMoveHandler);
        }
    }

    inicializarScrollEffects() {
        let scrollTimeout;
        
        this.scrollHandler = () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.hero, .sobre-imagem');
            
            parallaxElements.forEach(element => {
                const speed = element.classList.contains('hero') ? 0.5 : 0.3;
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const elementos = document.querySelectorAll('.fade-in');
                elementos.forEach(elemento => {
                    const topoElemento = elemento.getBoundingClientRect().top;
                    const elementoVisivel = 150;
                    
                    if (topoElemento < window.innerHeight - elementoVisivel) {
                        elemento.style.opacity = '1';
                        elemento.style.transform = 'translateY(0)';
                    }
                });
            }, 10);
        };
        
        window.addEventListener('scroll', this.scrollHandler);
    }

    inicializarEfeitoDigitacao() {
        const texto = "Estudante de Análise e Desenvolvimento de SISTEMAS & Cibersegurança";
        const elemento = document.getElementById('texto-digitacao');
        
        if (elemento) {
            elemento.innerHTML = '';
            elemento.style.borderRight = '2px solid var(--destaque)';
            elemento.style.paddingRight = '5px';
            elemento.style.display = 'inline-block';
            
            let i = 0;
            
            const digitar = () => {
                if (i < texto.length) {
                    elemento.innerHTML += texto.charAt(i);
                    i++;
                    setTimeout(digitar, 60);
                } else {
                    setTimeout(() => {
                        elemento.style.borderRight = 'none';
                        elemento.style.paddingRight = '0';
                    }, 500);
                }
            };
            
            setTimeout(digitar, 1000);
        }
    }

    inicializarFormulario() {
        const formulario = document.getElementById('formularioContato');
        if (!formulario) return;

        formulario.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = formulario.querySelector('.btn');
            const statusDiv = document.getElementById('mensagemStatus');
            
            if (!this.validarFormulario(formulario)) {
                this.mostrarStatus(statusDiv, 'Por favor, preencha todos os campos corretamente.', 'erro');
                return;
            }
            
            btn.classList.add('carregando');
            statusDiv.style.display = 'none';
            
            try {
                await this.enviarFormulario(formulario);
                this.mostrarStatus(statusDiv, 'Mensagem enviada com sucesso! Entrarei em contato em breve.', 'sucesso');
                formulario.reset();
            } catch (error) {
                this.mostrarStatus(statusDiv, 'Erro ao enviar mensagem. Tente novamente.', 'erro');
            } finally {
                btn.classList.remove('carregando');
            }
        });
    }

    validarFormulario(formulario) {
        const nome = formulario.querySelector('#nome').value.trim();
        const email = formulario.querySelector('#email').value.trim();
        const assunto = formulario.querySelector('#assunto').value.trim();
        const mensagem = formulario.querySelector('#mensagem').value.trim();
        
        if (!nome || !email || !assunto || !mensagem) {
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return false;
        }
        
        return true;
    }

    async enviarFormulario(formulario) {
        const formData = new FormData();
        formData.append('nome', formulario.querySelector('#nome').value);
        formData.append('email', formulario.querySelector('#email').value);
        formData.append('assunto', formulario.querySelector('#assunto').value);
        formData.append('mensagem', formulario.querySelector('#mensagem').value);
        formData.append('_subject', 'Novo contato do portfólio');
        formData.append('_captcha', 'false');
        formData.append('_template', 'table');

        try {
            const response = await fetch('https://formsubmit.co/ajax/matheussantosxx6@gmail.com', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                return { success: true };
            } else {
                throw new Error('Erro no envio');
            }
        } catch (error) {
            const emailBody = `Nome: ${formData.get('nome')}%0D%0AEmail: ${formData.get('email')}%0D%0AAssunto: ${formData.get('assunto')}%0D%0AMensagem: ${formData.get('mensagem')}`;
            window.location.href = `mailto:matheussantosxx6@gmail.com?subject=Contato%20Portfólio&body=${emailBody}`;
            return { success: true };
        }
    }

    mostrarStatus(elemento, mensagem, tipo) {
        if (!elemento) return;
        
        elemento.textContent = mensagem;
        elemento.className = `mensagem-status ${tipo}`;
        elemento.style.display = 'block';
        
        setTimeout(() => {
            elemento.style.display = 'none';
        }, 5000);
    }

    inicializarNavegacao() {
        const menuToggle = document.querySelector('.menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                document.querySelector('.nav-links').classList.toggle('active');
            });
        }
        
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                    
                    document.querySelector('.nav-links').classList.remove('active');
                }
            });
        });
        
        document.addEventListener('click', (e) => {
            const menu = document.querySelector('.nav-links');
            const toggle = document.querySelector('.menu-toggle');
            
            if (menu && toggle && !menu.contains(e.target) && !toggle.contains(e.target)) {
                menu.classList.remove('active');
            }
        });
    }

    destroy() {
        this.pararParticulas();
        this.pararEfeitoMouse();
        
        if (this.scrollHandler) {
            window.removeEventListener('scroll', this.scrollHandler);
        }
        
        if (this.mouseMoveHandler) {
            document.removeEventListener('mousemove', this.mouseMoveHandler);
        }
    }
}

const portfolioApp = new PortfolioApp();
window.PortfolioApp = portfolioApp;