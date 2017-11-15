<?php

header('Content-Type: text/html; charset=UTF-8');



if(!isset($_POST['inputs'])){
	die("error");
}

$inputs = $_POST['inputs'];

$error = '';
	
if(empty($inputs['name'])) $error .= ' name';
	if(strlen($inputs['name']) < 3) $error .= ' name';
if(empty($inputs['surname'])) $error .= ' surname';
	if(strlen($inputs['surname']) < 3) $error .= ' surname';
if(empty($inputs['email'])) $error .= ' email';
	if(strlen($inputs['email']) < 3) $error .= ' email';
	if ((strlen($inputs['email']) > 96) || !filter_var($inputs['email'], FILTER_VALIDATE_EMAIL)) {
		$error .= ' email';
	}
if(empty($inputs['investment'])) $error .= ' investment';
	if(strlen($inputs['investment']) < 1) $error .= ' investment';
if(empty($inputs['country'])) $error .= ' country';
	if(strlen($inputs['country']) < 3) $error .= ' country';
	
if(strlen($error) > 0){
	$error = substr($error, 1);
	echo $error;
	exit;
}



$data = [
	'email'     => $inputs['email'],
	'name'     => $inputs['name'],
	'surname'     => $inputs['surname'],
	'investment'     => $inputs['investment'],
	'country'     => $inputs['country'],
	'comment'     => $inputs['comment'],
	'status'    => 'subscribed'
];
function syncMailchimp($data) {
	$apiKey = '7d0cdc8e5580a536cb815196b56d3643-us11';
	$listId = '7d77cd0e55';
	$memberId = md5(strtolower($data['email']));
	$dataCenter = substr($apiKey,strpos($apiKey,'-')+1);
	$url = 'https://' . $dataCenter . '.api.mailchimp.com/3.0/lists/' . $listId . '/members/' . $memberId;
	$json = json_encode([
		'email_address' => $data['email'],
		'status'        => $data['status'], // "subscribed","unsubscribed","cleaned","pending"
		'merge_fields'  => [
			'FNAME'     => $data['name'],
			'LNAME'     => $data['surname'],
			'INVESTMENT'     => $data['investment'],
			'COUNTRY'     => $data['country'],
			'COMMENT'     => $data['comment']
		]
	]);
	$ch = curl_init($url);
	curl_setopt($ch, CURLOPT_USERPWD, 'user:' . $apiKey);
	curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_TIMEOUT, 10);
	curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
	$result = curl_exec($ch);
	$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	curl_close($ch);
	//echo $result;
	return $result;
}
syncMailchimp($data);
die("ok");







die("ok");

?>