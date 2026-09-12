import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'SikshyaNepal college, admission and result information for Nepal'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{display:'flex',height:'100%',width:'100%',flexDirection:'column',justifyContent:'space-between',background:'#f8fafc',padding:'72px 82px',fontFamily:'Arial, sans-serif',color:'#0f172a'}}>
      <div style={{display:'flex',alignItems:'center',gap:20,fontSize:38,fontWeight:700,color:'#2146ad'}}>
        <div style={{display:'flex',height:66,width:66,alignItems:'center',justifyContent:'center',borderRadius:16,background:'#2146ad',color:'white'}}>SN</div>
        SikshyaNepal
      </div>
      <div style={{display:'flex',maxWidth:950,flexDirection:'column'}}>
        <div style={{fontSize:72,fontWeight:800,lineHeight:1.08,letterSpacing:'-2px'}}>Compare colleges before you apply.</div>
        <div style={{marginTop:28,fontSize:29,lineHeight:1.4,color:'#475569'}}>Check programmes, published fees, admissions and source dates for colleges across Nepal.</div>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:22,color:'#64748b'}}><span>Schools · Colleges · Programs · Results</span><span>Education in Nepal</span></div>
    </div>,
    size,
  )
}
