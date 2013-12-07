#!/bin/bash
# ###################################################################
# This script checks for Oracle 11GR2 kernel parameters prerequisites
# for a linux x86 architecture
# ###################################################################
# Output modifiers parameters
COLOR_OK="\E[;;32m"
COLOR_NOK="\E[;;31m"
FONT_BOLD="\033[1m"
FONT_NORMAL="\033[0m"

# This function checks if a given parameter is correctly set
check_param_val(){
  local PARAM_NAME=$1
  local PARAM_VALUE=$2
  local REF_VALUE=$3
  if [[ ${PARAM_VALUE} -ge ${REF_VALUE} ]]
  then
    echo -en "${FONT_NORMAL}# [${COLOR_OK}${FONT_BOLD}OK${FONT_NORMAL}]"
    echo " ${PARAM_NAME} is correctly set (${PARAM_VALUE})."
    return 0
  else
    echo -en "${FONT_NORMAL}# [${COLOR_NOK}${FONT_BOLD}NOK${FONT_NORMAL}]"
    echo -n " ${PARAM_NAME} is NOT correctly set (is: ${PARAM_VALUE},"
    echo " must be at least ${REF_VALUE})"
    return 1
  fi
}
 
# This function checks a single value and gives the corrective action
check_single_param(){
  local PARAM_NAME=$1
  local PARAM_VALUE=$(sysctl -n ${PARAM_NAME})
  local REF_VALUE=$2
  check_param_val $PARAM_NAME $PARAM_VALUE $REF_VALUE
  if [[ $? -ne 0 ]]
  then
    echo -e "${FONT_NORMAL}# ${COLOR_NOK}${FONT_BOLD} Corrective action:${FONT_NORMAL}"
    echo "/sbin/sysctl -w ${PARAM_NAME}=${REF_VALUE}"
    echo "/sbin/sysctl -p"
  fi
}

check_table_param(){
  local PARAM_NAME=$1
  local PARAM_VALUES=( $(sysctl -n ${PARAM_NAME}) )
  shift
  local REF_VALUES=( $@ )
  local ERROR_FLAG=0
  for idx in "${!REF_VALUES[@]}"
  do
    check_param_val "${PARAM_NAME} (#$idx)" ${PARAM_VALUES[$idx]} ${REF_VALUES[$idx]}
    if [[ $? -ne 0 ]]; then
      ERROR_FLAG=1
    else
      REF_VALUES[$idx]=${PARAM_VALUES[$idx]}
    fi
  done
  if [[ $ERROR_FLAG -ne 0 ]]
  then
    echo -e "${FONT_NORMAL}# ${COLOR_NOK}${FONT_BOLD} Corrective action:${FONT_NORMAL}"
    echo "/sbin/sysctl -w ${PARAM_NAME}=\"${REF_VALUES[*]}\" "
    echo "/sbin/sysctl -p"
  fi
}

# Checking 'kernel.semmsl' 'kernel.semmns' 'kernel.semopm' 'kernel.semmni'
TMP_MIN="250 32000 100 128"
check_table_param 'kernel.sem' $TMP_MIN

check_single_param 'kernel.shmall' 2097152
check_single_param 'kernel.shmmax' 536870912
check_single_param 'kernel.shmmni' 4096
check_single_param 'fs.file-max' 6815744
# Checking 'ip_local_port_range'
TMP_MIN="9000 65500"
check_table_param 'net.ipv4.ip_local_port_range' $TMP_MIN
check_single_param 'net.core.rmem_default' 262144
check_single_param 'net.core.rmem_max' 4194304
check_single_param 'net.core.wmem_default' 262144
check_single_param 'net.core.wmem_max' 1048576
check_single_param 'fs.aio-max-nr' 1048576

echo -en "${FONT_NORMAL}# ${COLOR_NOK}${FONT_BOLD} If running on Suse Linux, "
echo -e "special actions have to be taken. Check the documentation.${FONT_NORMAL}"
