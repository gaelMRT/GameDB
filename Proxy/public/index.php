<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
$link = $_REQUEST['url'];
$body = $_REQUEST['body'];
if(substr($body,-1) != ';'){
	echo "ERREUR DANS LE MODULE DE COMMANDE";
	exit();
}
$re = callApi("POST",$link,$body);
echo($re);
// Method: POST, PUT, GET etc
// Data: array("param" => "value") ==> index.php?param=value

function callAPI($method, $url, $data = false)
{
	try{
		$curl = curl_init();

		$headers = array(
		'Accept: application/json',
		'Content-Type: application/json','user-key: c364edc9293459fe126c3de23e9bf176');
		switch ($method)
		{
			case "POST":
				curl_setopt($curl, CURLOPT_POST, 1);

				if ($data)
					curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
				break;
			case "PUT":
				curl_setopt($curl, CURLOPT_PUT, 1);
				break;
			default:
				if ($data)
					$url = sprintf("%s?%s", $url, http_build_query($data));
		}

		// Optional Authentication:
		//curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
		//curl_setopt($curl, CURLOPT_USERPWD, "username:password");

		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
		//curl_setopt($curl, CURLOPT_HTTPHEADER, array('user-key: c364edc9293459fe126c3de23e9bf176'));
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

		$result = curl_exec($curl);
		// Check the return value of curl_exec(), too
			if ($result === false) {
				throw new Exception(curl_error($curl), curl_errno($curl));
			}
		curl_close($curl);

		return $result;
	} catch(Exception $e) {
		echo sprintf('Curl failed with error #%d: %s',$e->getCode(), $e->getMessage());
	}
}