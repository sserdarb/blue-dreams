import { getFiles } from '@/app/actions/media'
import AiPlannerClient from './AiPlannerClient'

export const dynamic = 'force-dynamic'

export default async function AiPlannerPage() {
    const files = await getFiles()
    return <AiPlannerClient initialFiles={files} />
}
