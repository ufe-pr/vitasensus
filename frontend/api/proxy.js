const httpProxy = require('http-proxy');
const HttpProxyRules = require('http-proxy-rules');
const proxyRules = new HttpProxyRules({
	rules: {
		'/operator-buidl/*': process.env.REACT_APP_TESTNET_VITASENSUS_SERVER_URL, // Rule (1) docs, about, etc
		'/operator-mainnet/*': process.env.REACT_APP_MAINNET_VITASENSUS_SERVER_URL,
		'/gvite-testnet/*': process.env.REACT_APP_TEST_NETWORK,
		'/gvite-mainnet/*': process.env.REACT_APP_MAIN_NETWORK,
	},
});
const proxy = httpProxy.createProxy();

export default function handler(request, response) {
	try {
		var target = proxyRules.match(request);
		if (target) {
			//console.log("TARGET", target, req.url)
			return proxy.web(request, response, { target: target }, function (e) {
				//console.log('PROXY ERR',e)
			});
		} else {
			response.status(404);
		}
	} catch (e) {
		response.status(500);
	}
}
