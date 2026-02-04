import './ERD.css';

function ERD() {
  return (
    <div className="erd-page">
      <div className="erd-header">
        <h1 className="page-title">Database ERD Diagram</h1>
        <p className="erd-subtitle">Simplified Entity Relationship Diagram for TeeUp Golf Marketplace</p>
      </div>

      <div className="erd-container">
        <svg className="erd-svg" viewBox="0 0 1800 1000" preserveAspectRatio="xMidYMid meet">
          <defs>
            {/* Crow's foot marker for "many" side */}
            <marker id="crowsfoot" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
              <path d="M 0 0 L 12 6 L 0 12 L 2 6 Z" fill="#333" />
            </marker>
            {/* Circle for "zero or many" */}
            <marker id="circle" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <circle cx="4" cy="4" r="3" fill="none" stroke="#333" strokeWidth="1.5" />
            </marker>
          </defs>

          {/* Relationship Lines with Crow's Foot Notation */}
          
          {/* Users → Listings (Seller_ID) - One to Many */}
          <line x1="350" y1="200" x2="500" y2="140" stroke="#333" strokeWidth="1.5"/>
          <line x1="500" y1="140" x2="500" y2="135" stroke="#333" strokeWidth="2"/>
          <line x1="500" y1="140" x2="500" y2="145" stroke="#333" strokeWidth="2"/>
          <path d="M 350 200 L 345 200 L 350 195 L 350 200 L 350 205" stroke="#333" strokeWidth="2" fill="none"/>
          <circle cx="500" cy="140" r="3" fill="none" stroke="#333" strokeWidth="1.5"/>

          {/* Users (Admin) → Listings (Approved_By) - One to Many */}
          <line x1="350" y1="250" x2="500" y2="165" stroke="#333" strokeWidth="1.5"/>
          <line x1="500" y1="165" x2="500" y2="160" stroke="#333" strokeWidth="2"/>
          <line x1="500" y1="165" x2="500" y2="170" stroke="#333" strokeWidth="2"/>
          <path d="M 350 250 L 345 250 L 350 245 L 350 250 L 350 255" stroke="#333" strokeWidth="2" fill="none"/>
          <circle cx="500" cy="165" r="3" fill="none" stroke="#333" strokeWidth="1.5"/>
          <text x="425" y="200" className="relationship-label" fontSize="9" fill="#666">(Admin)</text>

          {/* Users → Reports (Reporter_ID) - One to Many */}
          <line x1="350" y1="250" x2="500" y2="610" stroke="#333" strokeWidth="1.5"/>
          <line x1="500" y1="610" x2="500" y2="605" stroke="#333" strokeWidth="2"/>
          <line x1="500" y1="610" x2="500" y2="615" stroke="#333" strokeWidth="2"/>
          <path d="M 350 250 L 345 250 L 350 245 L 350 250 L 350 255" stroke="#333" strokeWidth="2" fill="none"/>
          <circle cx="500" cy="610" r="3" fill="none" stroke="#333" strokeWidth="1.5"/>

          {/* Users (Admin) → Reports (Reviewed_By) - One to Many */}
          <line x1="350" y1="295" x2="500" y2="635" stroke="#333" strokeWidth="1.5"/>
          <line x1="500" y1="635" x2="500" y2="630" stroke="#333" strokeWidth="2"/>
          <line x1="500" y1="635" x2="500" y2="640" stroke="#333" strokeWidth="2"/>
          <path d="M 350 295 L 345 295 L 350 290 L 350 295 L 350 300" stroke="#333" strokeWidth="2" fill="none"/>
          <circle cx="500" cy="635" r="3" fill="none" stroke="#333" strokeWidth="1.5"/>
          <text x="425" y="460" className="relationship-label" fontSize="9" fill="#666">(Admin)</text>

          {/* Listings → Messages - One to Many */}
          <line x1="850" y1="140" x2="1100" y2="140" stroke="#333" strokeWidth="1.5"/>
          <line x1="1100" y1="140" x2="1100" y2="135" stroke="#333" strokeWidth="2"/>
          <line x1="1100" y1="140" x2="1100" y2="145" stroke="#333" strokeWidth="2"/>
          <path d="M 850 140 L 845 140 L 850 135 L 850 140 L 850 145" stroke="#333" strokeWidth="2" fill="none"/>
          <circle cx="1100" cy="140" r="3" fill="none" stroke="#333" strokeWidth="1.5"/>

          {/* Users → Messages (Sender_ID) - One to Many */}
          <line x1="350" y1="200" x2="1100" y2="165" stroke="#333" strokeWidth="1.5"/>
          <line x1="1100" y1="165" x2="1100" y2="160" stroke="#333" strokeWidth="2"/>
          <line x1="1100" y1="165" x2="1100" y2="170" stroke="#333" strokeWidth="2"/>
          <path d="M 350 200 L 345 200 L 350 195 L 350 200 L 350 205" stroke="#333" strokeWidth="2" fill="none"/>
          <circle cx="1100" cy="165" r="3" fill="none" stroke="#333" strokeWidth="1.5"/>

          {/* Users → Messages (Receiver_ID) - One to Many */}
          <line x1="350" y1="225" x2="1100" y2="190" stroke="#333" strokeWidth="1.5"/>
          <line x1="1100" y1="190" x2="1100" y2="185" stroke="#333" strokeWidth="2"/>
          <line x1="1100" y1="190" x2="1100" y2="195" stroke="#333" strokeWidth="2"/>
          <path d="M 350 225 L 345 225 L 350 220 L 350 225 L 350 230" stroke="#333" strokeWidth="2" fill="none"/>
          <circle cx="1100" cy="190" r="3" fill="none" stroke="#333" strokeWidth="1.5"/>

          {/* Users Table - Left (includes Admins) */}
          <g className="table-group">
            {/* Header */}
            <rect x="50" y="50" width="300" height="30" className="table-header"/>
            <text x="200" y="70" className="table-title">Users</text>
            
            {/* Body */}
            <rect x="50" y="80" width="300" height="360" className="table-body"/>
            <line x1="50" y1="80" x2="350" y2="80" className="table-divider"/>
            
            <text x="70" y="105" className="field-pk">PK</text>
            <text x="100" y="105" className="field-name">id</text>
            <text x="220" y="105" className="field-type">(integer)</text>
            
            <text x="70" y="130" className="field-name">username</text>
            <text x="220" y="130" className="field-type">(varchar)</text>
            
            <text x="70" y="155" className="field-name">email</text>
            <text x="220" y="155" className="field-type">(varchar)</text>
            
            <text x="70" y="180" className="field-name">name</text>
            <text x="220" y="180" className="field-type">(varchar)</text>
            
            <text x="70" y="205" className="field-name">password_hash</text>
            <text x="220" y="205" className="field-type">(varchar)</text>
            
            <text x="70" y="230" className="field-name">user_type</text>
            <text x="220" y="230" className="field-type">(enum)</text>
            <text x="100" y="250" className="field-type" fontSize="11" fill="#666">user | admin</text>
            
            <text x="70" y="275" className="field-name">status</text>
            <text x="220" y="275" className="field-type">(enum)</text>
            
            <text x="70" y="300" className="field-name">profile_photo_url</text>
            <text x="220" y="300" className="field-type">(varchar)</text>
            
            <text x="70" y="325" className="field-name">location</text>
            <text x="220" y="325" className="field-type">(varchar)</text>
            
            <text x="70" y="350" className="field-name">created_at</text>
            <text x="220" y="350" className="field-type">(timestamp)</text>
            
            <text x="70" y="375" className="field-name">updated_at</text>
            <text x="220" y="375" className="field-type">(timestamp)</text>
          </g>

          {/* Listings Table - Center Top */}
          <g className="table-group">
            {/* Header */}
            <rect x="500" y="50" width="350" height="30" className="table-header"/>
            <text x="675" y="70" className="table-title">Listings</text>
            
            {/* Body */}
            <rect x="500" y="80" width="350" height="320" className="table-body"/>
            <line x1="500" y1="80" x2="850" y2="80" className="table-divider"/>
            
            <text x="520" y="105" className="field-pk">PK</text>
            <text x="550" y="105" className="field-name">id</text>
            <text x="700" y="105" className="field-type">(integer)</text>
            
            <text x="520" y="130" className="field-fk">FK1</text>
            <text x="550" y="130" className="field-name">seller_id</text>
            <text x="700" y="130" className="field-type">(integer)</text>
            
            <text x="520" y="155" className="field-fk">FK2</text>
            <text x="550" y="155" className="field-name">approved_by</text>
            <text x="700" y="155" className="field-type">(integer)</text>
            
            <text x="520" y="180" className="field-name">title</text>
            <text x="700" y="180" className="field-type">(varchar)</text>
            
            <text x="520" y="205" className="field-name">description</text>
            <text x="700" y="205" className="field-type">(text)</text>
            
            <text x="520" y="230" className="field-name">category</text>
            <text x="700" y="230" className="field-type">(enum)</text>
            
            <text x="520" y="255" className="field-name">condition</text>
            <text x="700" y="255" className="field-type">(enum)</text>
            
            <text x="520" y="280" className="field-name">price</text>
            <text x="700" y="280" className="field-type">(decimal)</text>
            
            <text x="520" y="305" className="field-name">images</text>
            <text x="700" y="305" className="field-type">(json)</text>
            
            <text x="520" y="330" className="field-name">status</text>
            <text x="700" y="330" className="field-type">(enum)</text>
            
            <text x="520" y="355" className="field-name">location</text>
            <text x="700" y="355" className="field-type">(varchar)</text>
            
            <text x="520" y="380" className="field-name">created_at</text>
            <text x="700" y="380" className="field-type">(timestamp)</text>
            
            <text x="520" y="405" className="field-name">updated_at</text>
            <text x="700" y="405" className="field-type">(timestamp)</text>
          </g>

          {/* Reports Table - Center Bottom */}
          <g className="table-group">
            {/* Header */}
            <rect x="500" y="450" width="350" height="30" className="table-header"/>
            <text x="675" y="470" className="table-title">Reports</text>
            
            {/* Body */}
            <rect x="500" y="480" width="350" height="280" className="table-body"/>
            <line x1="500" y1="480" x2="850" y2="480" className="table-divider"/>
            
            <text x="520" y="505" className="field-pk">PK</text>
            <text x="550" y="505" className="field-name">id</text>
            <text x="700" y="505" className="field-type">(integer)</text>
            
            <text x="520" y="530" className="field-name">reported_type</text>
            <text x="700" y="530" className="field-type">(enum)</text>
            
            <text x="520" y="555" className="field-name">reported_id</text>
            <text x="700" y="555" className="field-type">(integer)</text>
            
            <text x="520" y="580" className="field-fk">FK1</text>
            <text x="550" y="580" className="field-name">reporter_id</text>
            <text x="700" y="580" className="field-type">(integer)</text>
            
            <text x="520" y="605" className="field-fk">FK2</text>
            <text x="550" y="605" className="field-name">reviewed_by</text>
            <text x="700" y="605" className="field-type">(integer)</text>
            
            <text x="520" y="630" className="field-name">reason</text>
            <text x="700" y="630" className="field-type">(text)</text>
            
            <text x="520" y="655" className="field-name">status</text>
            <text x="700" y="655" className="field-type">(enum)</text>
            
            <text x="520" y="680" className="field-name">reviewed_at</text>
            <text x="700" y="680" className="field-type">(timestamp)</text>
            
            <text x="520" y="705" className="field-name">created_at</text>
            <text x="700" y="705" className="field-type">(timestamp)</text>
            
            <text x="520" y="730" className="field-name">updated_at</text>
            <text x="700" y="730" className="field-type">(timestamp)</text>
          </g>

          {/* Messages Table - Right */}
          <g className="table-group">
            {/* Header */}
            <rect x="1100" y="50" width="350" height="30" className="table-header"/>
            <text x="1275" y="70" className="table-title">Messages</text>
            
            {/* Body */}
            <rect x="1100" y="80" width="350" height="240" className="table-body"/>
            <line x1="1100" y1="80" x2="1450" y2="80" className="table-divider"/>
            
            <text x="1120" y="105" className="field-pk">PK</text>
            <text x="1150" y="105" className="field-name">id</text>
            <text x="1300" y="105" className="field-type">(integer)</text>
            
            <text x="1120" y="130" className="field-fk">FK1</text>
            <text x="1150" y="130" className="field-name">listing_id</text>
            <text x="1300" y="130" className="field-type">(integer)</text>
            
            <text x="1120" y="155" className="field-fk">FK2</text>
            <text x="1150" y="155" className="field-name">sender_id</text>
            <text x="1300" y="155" className="field-type">(integer)</text>
            
            <text x="1120" y="180" className="field-fk">FK3</text>
            <text x="1150" y="180" className="field-name">receiver_id</text>
            <text x="1300" y="180" className="field-type">(integer)</text>
            
            <text x="1120" y="205" className="field-name">message</text>
            <text x="1300" y="205" className="field-type">(text)</text>
            
            <text x="1120" y="230" className="field-name">read</text>
            <text x="1300" y="230" className="field-type">(boolean)</text>
            
            <text x="1120" y="255" className="field-name">created_at</text>
            <text x="1300" y="255" className="field-type">(timestamp)</text>
          </g>

        </svg>
      </div>
    </div>
  );
}

export default ERD;
