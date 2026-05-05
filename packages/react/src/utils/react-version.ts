import React from 'react';

// React 19 natively bridges props to custom-element properties (including
// empty strings, `false` booleans, functions, and objects). On React 18 we
// must imperatively assign these properties via useEffect. Wrappers gate
// their bridging effects on this flag so the workaround is dead code on
// React 19+ and removable when React 18 support is eventually dropped.
export const needsPropertyBridge = parseInt(React.version, 10) < 19;
