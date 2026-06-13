import React from 'react';
import { getGaleriaAction } from '@/app/actions/galeria';
import { GaleriaItem } from '@/types';
import { Star, Quote, ShieldCheck } from 'lucide-react';
import Counter from './Counter';

// Depoimentos de fallback (caso não haja dados no banco ainda)
const FALLBACK: GaleriaItem[] = [
  { id: 'f1', created_at: '', tipo: 'depoimento', servico: 'geral', cliente_nome: 'Carlos Eduardo', cliente_cidade: 'Florianópolis, SC', avaliacao: 5, texto: 'Fiquei impressionado com a diferença na geração após a limpeza. A equipe foi muito técnica e cuidadosa. Recomendo fortemente!', ativo: true },
  { id: 'f2', created_at: '', tipo: 'depoimento', servico: 'geral', cliente_nome: 'Mariana Souza', cliente_cidade: 'Joinville, SC', avaliacao: 5, texto: 'Instalação impecável. Tudo organizado, cabos bem passados e suporte nota 10. Me senti muito segura durante todo o processo.', ativo: true },
  { id: 'f3', created_at: '', tipo: 'depoimento', servico: 'geral', cliente_nome: 'Roberto Almeida', cliente_cidade: 'Blumenau, SC', avaliacao: 5, texto: 'O aquecimento de piso foi a melhor decisão da nossa casa. Conforto térmico absoluto e acabamento de primeira.', ativo: true },
];

interface GaleriaSectionProps {
  servico?: string;   // se passado, filtra pelo serviço da página
  titulo?: string;
  subtitulo?: string;
}

export default async function GaleriaSection({ servico, titulo, subtitulo }: GaleriaSectionProps) {
  let items: GaleriaItem[] = [];

  try {
    const res = await getGaleriaAction(servico);
    if (res.success && res.data && res.data.length > 0) {
      items = res.data;
    }
  } catch {
    // usa fallback
  }

  const useFallback = items.length === 0;
  const depoimentos = (useFallback ? FALLBACK : items).filter(i => i.tipo === 'depoimento' || i.tipo === 'ambos');
  const fotos       = (useFallback ? [] : items).filter(i => i.tipo === 'foto' || i.tipo === 'ambos');

  const headingTitulo   = titulo    || 'O QUE NOSSOS <span>CLIENTES</span> DIZEM';
  const headingSubtitulo = subtitulo || (
    <span>São mais de <Counter target={250} /> clientes atendidos com excelência em Santa Catarina.</span>
  );

  return (
    <section className="py-16 px-6 w-full max-w-7xl mx-auto z-10 relative space-y-16">

      {/* Galeria de Fotos */}
      {fotos.length > 0 && (
        <div>
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-montserrat font-black text-brand-navy dark:text-slate-100 mb-4 uppercase tracking-tighter">
              FOTOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-emerald to-emerald-400">REAIS</span> DA INSTALAÇÃO
            </h2>
            <div className="w-20 h-1.5 bg-brand-orange mx-auto rounded-full mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-base font-medium max-w-xl mx-auto">
              Registros reais dos nossos projetos concluídos.
            </p>
          </div>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {fotos.map((item) => (
              <div key={item.id} className="break-inside-avoid rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 group relative">
                <img
                  src={item.foto_url!}
                  alt={`Instalação para ${item.cliente_nome}`}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={() => {}}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div>
                    <p className="text-white font-bold text-sm">{item.cliente_nome}</p>
                    {item.cliente_cidade && <p className="text-white/70 text-xs">{item.cliente_cidade}</p>}
                    {item.texto && <p className="text-white/80 text-xs mt-1 italic line-clamp-2">"{item.texto}"</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Depoimentos */}
      {depoimentos.length > 0 && (
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-montserrat font-black text-brand-navy dark:text-slate-100 mb-6 uppercase tracking-tighter leading-tight"
              dangerouslySetInnerHTML={{ __html: headingTitulo.replace('<span>', '<span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-emerald to-emerald-400">') }} />
            <div className="w-24 h-1.5 bg-brand-orange mx-auto rounded-full mb-6" />
            <p className="text-slate-500 dark:text-slate-400 text-base md:text-xl font-medium max-w-2xl mx-auto">
              {headingSubtitulo}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {depoimentos.slice(0, 6).map((item, index) => (
              <div
                key={item.id}
                className="group flex flex-col h-full relative glass dark:glass-dark rounded-[2.5rem] p-8 md:p-10 border border-white/40 dark:border-slate-800/50 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-brand-emerald/10 hover:-translate-y-2"
              >
                {/* Quote Icon */}
                <div className="absolute -top-6 -left-4 w-12 h-12 bg-brand-orange rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/30 group-hover:scale-110 transition-transform">
                  <Quote className="w-6 h-6 fill-current" />
                </div>

                {/* Foto do projeto (se houver + depoimento) */}
                {item.foto_url && item.tipo === 'ambos' && (
                  <div className="mb-4 rounded-xl overflow-hidden h-36 -mx-2">
                    <img src={item.foto_url} alt={`Projeto de ${item.cliente_nome}`}
                      className="w-full h-full object-cover"
                      onError={() => {}} />
                  </div>
                )}

                <div className="flex-1 mb-8 pt-4">
                  <div className="flex gap-0.5 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= item.avaliacao ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 dark:text-slate-700'}`} />
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 italic text-base md:text-lg leading-relaxed font-medium">
                    "{item.texto}"
                  </p>
                </div>

                <div className="mt-auto pt-8 border-t border-slate-100 dark:border-slate-800/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-emerald to-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-inner">
                      {item.cliente_nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black text-brand-navy dark:text-slate-100 uppercase tracking-tight">
                        {item.cliente_nome}
                      </p>
                      {item.cliente_cidade && (
                        <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest leading-tight">
                          {item.cliente_cidade}
                        </p>
                      )}
                    </div>
                  </div>
                  {item.servico && item.servico !== 'geral' && (
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-brand-emerald/10 text-brand-emerald text-[9px] font-black uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3" /> {item.servico}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
