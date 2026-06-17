import { useEffect, useState } from 'react'

import { useToast } from '../../providers/toast'
import api from '../../services/axios'

interface IModelListProps {
    eventId: string
}

interface IModel {
    id: string
    name: string
    pages: Array<{
        type: string
        image: string
        text: string
        layout: {
            padding: { top: string; right: number; bottom: number; left: string }
            vertical: { name: string; value: number }
            horizontal: { name: string; value: number }
        }
    }>
    created_at: string
}

export const ModelList: React.FC<IModelListProps> = ({ eventId }) => {
    const [models, setModels] = useState<IModel[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedModel, setSelectedModel] = useState<IModel | null>(null)
    const { addToast } = useToast()

    useEffect(() => {
        loadModels()
    }, [eventId])

    const loadModels = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/tipos-certificado/${eventId}/models`)
            setModels(response.data.data || [])
        } catch (error) {
            addToast({
                title: 'Erro ao carregar modelos',
                description: error?.response?.data?.message || 'Erro desconhecido',
                type: 'error'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (modelId: string) => {
        if (!confirm('Deseja realmente excluir este modelo?')) return

        try {
            await api.delete(`/tipos-certificado/${eventId}/models/${modelId}`)
            addToast({
                title: 'Modelo excluído com sucesso',
                type: 'success'
            })
            loadModels()
        } catch (error) {
            addToast({
                title: 'Erro ao excluir modelo',
                description: error?.response?.data?.message || 'Erro desconhecido',
                type: 'error'
            })
        }
    }

    if (loading) {
        return <div style={{ padding: '1rem' }}>Carregando modelos...</div>
    }

    if (models.length === 0) {
        return (
            <div
                style={{
                    padding: '1rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.375rem',
                    backgroundColor: '#f7fafc',
                    marginTop: '1rem'
                }}
            >
                <p style={{ color: '#718096' }}>Nenhum modelo cadastrado ainda.</p>
            </div>
        )
    }

    return (
        <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Modelos Cadastrados
            </h3>
            {models.map(model => (
                <div key={model.id}>
                    <div
                        style={{
                            padding: '1rem',
                            marginBottom: selectedModel?.id === model.id ? 0 : '0.75rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: selectedModel?.id === model.id ? '0.375rem 0.375rem 0 0' : '0.375rem',
                            backgroundColor: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            gap: '1rem'
                        }}
                        onClick={() => setSelectedModel(selectedModel?.id === model.id ? null : model)}
                    >
                        {/* Informações do modelo */}
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.25rem' }}>{model.name}</p>
                            <p style={{ fontSize: '0.875rem', color: '#718096' }}>
                                {model.pages.length} página(s)
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#a0aec0' }}>
                                Criado em: {new Date(model.created_at).toLocaleDateString('pt-BR')}
                            </p>
                        </div>

                        {/* Preview das imagens */}
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            {model.pages.map((page, index) => (
                                <div key={index} style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.625rem', color: '#718096', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                        {page.type === 'frente' ? 'Frente' : 'Verso'}
                                    </p>
                                    <img
                                        src={`${process.env.baseURL || 'http://localhost:4001'}/upload/${page.image}`}
                                        alt={page.type}
                                        style={{
                                            width: '100px',
                                            height: '70px',
                                            objectFit: 'cover',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '0.25rem',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                        }}
                                        onError={e => {
                                            e.currentTarget.style.border = '2px solid #fc8181'
                                            e.currentTarget.style.backgroundColor = '#fed7d7'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Botões de ação */}
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#3182ce',
                                    color: 'white',
                                    borderRadius: '0.25rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                }}
                                onClick={e => {
                                    e.stopPropagation()
                                    setSelectedModel(selectedModel?.id === model.id ? null : model)
                                }}
                                onMouseOver={e => (e.currentTarget.style.backgroundColor = '#2c5282')}
                                onMouseOut={e => (e.currentTarget.style.backgroundColor = '#3182ce')}
                            >
                                {selectedModel?.id === model.id ? 'Ocultar' : 'Visualizar'}
                            </button>
                            <button
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#f56565',
                                    color: 'white',
                                    borderRadius: '0.25rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                }}
                                onClick={e => {
                                    e.stopPropagation()
                                    handleDelete(model.id)
                                }}
                                onMouseOver={e => (e.currentTarget.style.backgroundColor = '#e53e3e')}
                                onMouseOut={e => (e.currentTarget.style.backgroundColor = '#f56565')}
                            >
                                Excluir
                            </button>
                        </div>
                    </div>

                    {/* Preview expandido */}
                    {selectedModel?.id === model.id && (
                        <div
                            style={{
                                border: '1px solid #e2e8f0',
                                borderTop: 'none',
                                borderRadius: '0 0 0.375rem 0.375rem',
                                padding: '1.5rem',
                                backgroundColor: '#f7fafc',
                                marginBottom: '0.75rem'
                            }}
                        >
                            <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                                Detalhes do Modelo
                            </h4>

                            {selectedModel.pages.map((page, index) => (
                                <div
                                    key={index}
                                    style={{
                                        marginBottom: '1.5rem',
                                        padding: '1rem',
                                        backgroundColor: 'white',
                                        borderRadius: '0.375rem',
                                        border: '1px solid #e2e8f0'
                                    }}
                                >
                                    <h5 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.75rem', textTransform: 'uppercase', color: '#4a5568' }}>
                                        {page.type === 'frente' ? '📄 Frente' : '📄 Verso'}
                                    </h5>

                                    {/* Imagem */}
                                    <div style={{ marginBottom: '1rem' }}>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#718096', marginBottom: '0.5rem' }}>
                                            Imagem de fundo:
                                        </p>
                                        <img
                                            src={`${process.env.baseURL || 'http://localhost:4001'}/upload/${page.image}`}
                                            alt={`${page.type}`}
                                            style={{
                                                maxWidth: '300px',
                                                maxHeight: '200px',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '0.25rem',
                                                objectFit: 'contain'
                                            }}
                                            onError={e => {
                                                e.currentTarget.style.display = 'none'
                                                e.currentTarget.nextElementSibling.style.display = 'block'
                                            }}
                                        />
                                        <div style={{ display: 'none', padding: '1rem', backgroundColor: '#fed7d7', color: '#742a2a', fontSize: '0.75rem', borderRadius: '0.25rem' }}>
                                            Imagem não encontrada: {page.image}
                                        </div>
                                    </div>

                                    {/* Texto HTML */}
                                    <div style={{ marginBottom: '1rem' }}>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#718096', marginBottom: '0.5rem' }}>
                                            Texto do certificado:
                                        </p>
                                        <div
                                            style={{
                                                padding: '0.75rem',
                                                backgroundColor: '#edf2f7',
                                                borderRadius: '0.25rem',
                                                fontSize: '0.875rem',
                                                maxHeight: '150px',
                                                overflow: 'auto',
                                                border: '1px solid #cbd5e0'
                                            }}
                                            dangerouslySetInnerHTML={{ __html: page.text }}
                                        />
                                    </div>

                                    {/* Layout */}
                                    <div>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#718096', marginBottom: '0.5rem' }}>
                                            Configurações de layout:
                                        </p>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.75rem' }}>
                                            <div style={{ padding: '0.5rem', backgroundColor: '#edf2f7', borderRadius: '0.25rem' }}>
                                                <strong>Padding:</strong> {page.layout.padding.top}px (topo), {page.layout.padding.right}px (direita), {page.layout.padding.bottom}px (baixo), {page.layout.padding.left}px (esquerda)
                                            </div>
                                            <div style={{ padding: '0.5rem', backgroundColor: '#edf2f7', borderRadius: '0.25rem' }}>
                                                <strong>Vertical:</strong> {page.layout.vertical.name} ({page.layout.vertical.value}px)
                                            </div>
                                            <div style={{ padding: '0.5rem', backgroundColor: '#edf2f7', borderRadius: '0.25rem' }}>
                                                <strong>Horizontal:</strong> {page.layout.horizontal.name} ({page.layout.horizontal.value}px)
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
