'use client'

import React, { useCallback, useMemo } from 'react'
import {
    ReactFlow, Background, Controls, MiniMap,
    addEdge, useNodesState, useEdgesState,
    type Node, type Edge, type Connection, type NodeProps,
    Handle, Position, MarkerType
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { CheckSquare, Clock, AlertTriangle, ArrowUpRight, Zap } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────
interface Task {
    id: string; title: string; status: string; priority: string
    assigneeId?: string | null; assignee?: { name: string } | null
    dueDate?: string | null; startDate?: string | null
    posX?: number | null; posY?: number | null; estimatedMin?: number | null
    dependencies?: any[]; dependents?: any[]
}

const STATUS_COLORS: Record<string, string> = {
    todo: '#64748b', in_progress: '#3b82f6', review: '#f59e0b', done: '#10b981', cancelled: '#ef4444'
}
const STATUS_LABELS: Record<string, string> = {
    todo: 'Yapılacak', in_progress: 'Devam', review: 'İnceleme', done: 'Tamamlandı', cancelled: 'İptal'
}
const PRIORITY_ICONS: Record<string, string> = {
    low: '○', medium: '◐', high: '●', urgent: '🔴'
}

// ─── Custom Node ──────────────────────────────────────────────────────
function TaskNode({ data }: NodeProps) {
    const task = data.task as Task
    const borderColor = STATUS_COLORS[task.status] || '#64748b'

    return (
        <div
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border-2 p-3 min-w-[200px] max-w-[260px] cursor-grab active:cursor-grabbing"
            style={{ borderColor }}
        >
            <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-white dark:!border-slate-800" />
            <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white dark:!border-slate-800" />

            {/* Header */}
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: borderColor + '20', color: borderColor }}>
                    {STATUS_LABELS[task.status]}
                </span>
                <span className="text-sm" title={task.priority}>{PRIORITY_ICONS[task.priority]}</span>
            </div>

            {/* Title */}
            <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight mb-2 line-clamp-2">
                {task.title}
            </h4>

            {/* Meta */}
            <div className="flex items-center justify-between text-[11px] text-slate-400">
                {task.assignee && (
                    <span className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[9px] font-bold">
                            {task.assignee.name?.charAt(0)}
                        </span>
                        {task.assignee.name?.split(' ')[0]}
                    </span>
                )}
                {task.dueDate && (
                    <span className="flex items-center gap-1 text-amber-500">
                        <Clock size={10} />
                        {new Date(task.dueDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                    </span>
                )}
                {task.estimatedMin && (
                    <span className="text-slate-500">{Math.round(task.estimatedMin / 60)}s</span>
                )}
            </div>
        </div>
    )
}

const nodeTypes = { taskNode: TaskNode }

// ─── Main Component ────────────────────────────────────────────────
interface TaskFlowViewProps {
    tasks: Task[]
    onTaskClick?: (task: Task) => void
    onDependencyCreate?: (sourceId: string, targetId: string) => void
    onDependencyDelete?: (depId: string) => void
    onPositionUpdate?: (taskId: string, x: number, y: number) => void
}

export default function TaskFlowView({ tasks, onTaskClick, onDependencyCreate, onPositionUpdate }: TaskFlowViewProps) {
    // Generate nodes from tasks
    const initialNodes: Node[] = useMemo(() => {
        const statusGroups: Record<string, Task[]> = {}
        tasks.forEach(t => {
            if (!statusGroups[t.status]) statusGroups[t.status] = []
            statusGroups[t.status].push(t)
        })

        return tasks.map((task, i) => {
            // Use saved positions or auto-layout by status columns
            const statusOrder = ['todo', 'in_progress', 'review', 'done', 'cancelled']
            const colIdx = statusOrder.indexOf(task.status)
            const colTasks = statusGroups[task.status] || []
            const rowIdx = colTasks.indexOf(task)

            return {
                id: task.id,
                type: 'taskNode',
                position: {
                    x: task.posX ?? (colIdx * 320 + 50),
                    y: task.posY ?? (rowIdx * 150 + 80),
                },
                data: { task, label: task.title },
            }
        })
    }, [tasks])

    // Generate edges from dependencies
    const initialEdges: Edge[] = useMemo(() => {
        const edges: Edge[] = []
        tasks.forEach(task => {
            (task.dependencies || []).forEach((dep: any) => {
                edges.push({
                    id: dep.id || `${task.id}-${dep.targetTaskId || dep.targetTask?.id}`,
                    source: task.id,
                    target: dep.targetTaskId || dep.targetTask?.id,
                    type: 'smoothstep',
                    animated: task.status === 'in_progress',
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
                    style: { stroke: '#06b6d4', strokeWidth: 2 },
                })
            })
        })
        return edges
    }, [tasks])

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    const onConnect = useCallback((connection: Connection) => {
        if (connection.source && connection.target) {
            setEdges(eds => addEdge({
                ...connection,
                type: 'smoothstep',
                animated: true,
                markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
                style: { stroke: '#8b5cf6', strokeWidth: 2 },
            }, eds))
            onDependencyCreate?.(connection.source, connection.target)
        }
    }, [setEdges, onDependencyCreate])

    const onNodeDragStop = useCallback((_: any, node: Node) => {
        onPositionUpdate?.(node.id, node.position.x, node.position.y)
    }, [onPositionUpdate])

    const onNodeClick = useCallback((_: any, node: Node) => {
        const task = tasks.find(t => t.id === node.id)
        if (task) onTaskClick?.(task)
    }, [tasks, onTaskClick])

    return (
        <div className="w-full h-[calc(100vh-280px)] min-h-[500px] bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Status Column Headers */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-4">
                {['todo', 'in_progress', 'review', 'done'].map(s => (
                    <div key={s} className="flex-1 py-2 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                            style={{ backgroundColor: STATUS_COLORS[s] + '20', color: STATUS_COLORS[s] }}>
                            {STATUS_LABELS[s]}
                        </span>
                    </div>
                ))}
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDragStop={onNodeDragStop}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                proOptions={{ hideAttribution: true }}
                className="bg-slate-50 dark:bg-slate-900"
            >
                <Background color="#94a3b8" gap={24} size={1} />
                <Controls className="!bg-white dark:!bg-slate-800 !border-slate-200 dark:!border-slate-700 !shadow-lg" />
                <MiniMap
                    nodeColor={(node) => STATUS_COLORS[(node.data?.task as Task)?.status] || '#64748b'}
                    className="!bg-white dark:!bg-slate-800 !border-slate-200 dark:!border-slate-700"
                />
            </ReactFlow>
        </div>
    )
}
